import {spawn} from 'node:child_process';
import {mkdtemp,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {Router} from 'express';import {query,transaction} from '../../config/db.js';import {authenticate,requirePermission} from '../../middleware/auth.js';import {asyncHandler} from '../../utils/asyncHandler.js';import {registrarAuditoria} from '../../middleware/audit.js';
export const accesosRouter=Router();accesosRouter.use(authenticate);
accesosRouter.get('/eventos',requirePermission('acceso.ver','historial.ver'),asyncHandler(async(req,res)=>{const {placa='',tipo='',desde='',hasta=''}=req.query;const r=await query(`SELECT e.*,v.referencia_propietario,v.categoria_usuario,u.nombre_completo autorizador_manual,d.nombre camara_nombre FROM eventos_acceso e LEFT JOIN vehiculos v ON v.id=e.vehiculo_id LEFT JOIN usuarios u ON u.id=e.autorizado_por LEFT JOIN dispositivos d ON d.id=e.camara_acceso_id WHERE($1='' OR UPPER(COALESCE(e.placa_detectada,'')) LIKE UPPER('%'||$1||'%')) AND($2='' OR e.tipo_evento=$2) AND($3='' OR e.fecha_hora >= $3::timestamptz) AND($4='' OR e.fecha_hora <= $4::timestamptz) ORDER BY e.fecha_hora DESC LIMIT 500`,[placa,tipo,desde,hasta]);res.json(r.rows)}));
async function resolverVehiculo(c,placa){if(!placa)return{vehiculoId:null,resultado:'PENDIENTE'};const v=await c.query(`SELECT v.id FROM vehiculos v JOIN autorizaciones_vehiculares a ON a.vehiculo_id=v.id WHERE UPPER(v.placa)=UPPER($1) AND v.estado='ACTIVO' AND a.estado='ACTIVA' AND a.valido_desde<=NOW() AND(a.valido_hasta IS NULL OR a.valido_hasta>=NOW()) ORDER BY a.creado_en DESC LIMIT 1`,[placa]);return v.rowCount?{vehiculoId:v.rows[0].id,resultado:'AUTORIZADO'}:{vehiculoId:null,resultado:'DENEGADO'}}
accesosRouter.post('/eventos',requirePermission('acceso.validar'),asyncHandler(async(req,res)=>{const b=req.body;const ev=await transaction(async c=>{const rv=await resolverVehiculo(c,b.placaDetectada);const resultado=rv.resultado; if(b.autorizadoManual||b.resultadoValidacion)return res.status(400).json({message:'Use el control de lectura con evidencia o la revisión manual autorizada.'});const cam=await c.query(`SELECT id FROM dispositivos WHERE codigo='CAM-LPR-ING-01' LIMIT 1`);const r=await c.query(`INSERT INTO eventos_acceso(tipo_evento,punto_acceso,camara_acceso_id,placa_detectada,vehiculo_id,imagen_url,confianza_reconocimiento,resultado_validacion,autorizado_manual,autorizado_por,observaciones,origen) VALUES($1,$2,$3,UPPER($4),$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,[b.tipoEvento||'INGRESO',b.puntoAcceso||'INGRESO PRINCIPAL',b.camaraAccesoId||cam.rows[0]?.id||null,b.placaDetectada||null,rv.vehiculoId,b.imagenUrl||null,b.confianza||null,resultado,!!b.autorizadoManual,b.autorizadoManual?req.user.sub:null,b.observaciones||null,b.origen||'CAMARA_IA']);if(b.placaDetectada)await c.query(`INSERT INTO resultados_reconocimiento_placa(evento_acceso_id,placa_detectada,confianza,resultado_crudo,estado_validacion,validado_por,validado_en) VALUES($1,UPPER($2),$3,$4,$5,$6,$7)`,[r.rows[0].id,b.placaDetectada,b.confianza||null,b.resultadoCrudo||{},b.autorizadoManual?'MANUAL_CONFIRMADO':'AUTOMATICO',b.autorizadoManual?req.user.sub:null,b.autorizadoManual?new Date():null]);return r.rows[0]});await registrarAuditoria({usuarioId:req.user.sub,accion:'EVENTO_ACCESO_CREAR',entidad:'eventos_acceso',entidadId:ev.id,detalle:{placa:ev.placa_detectada,resultado:ev.resultado_validacion},req});res.status(201).json(ev)}));
accesosRouter.post('/simular-camara',requirePermission('acceso.validar','configuracion.gestionar'),asyncHandler(async(req,res)=>{const {placaDetectada,tipoEvento='INGRESO'}=req.body;const ev=await transaction(async c=>{const rv=await resolverVehiculo(c,placaDetectada);const cam=await c.query(`SELECT id FROM dispositivos WHERE codigo='CAM-LPR-ING-01' LIMIT 1`);const r=await c.query(`INSERT INTO eventos_acceso(tipo_evento,punto_acceso,camara_acceso_id,placa_detectada,vehiculo_id,confianza_reconocimiento,resultado_validacion,origen) VALUES($1,'INGRESO PRINCIPAL',$2,UPPER($3),$4,95,$5,'SIMULADOR') RETURNING *`,[tipoEvento,cam.rows[0]?.id||null,placaDetectada,rv.vehiculoId,rv.resultado]);await c.query(`INSERT INTO resultados_reconocimiento_placa(evento_acceso_id,placa_detectada,confianza,resultado_crudo) VALUES($1,UPPER($2),95,$3)`,[r.rows[0].id,placaDetectada,{simulado:true}]);return r.rows[0]});res.status(201).json(ev)}));
accesosRouter.get('/reconocimientos',requirePermission('acceso.ver','acceso.validar'),asyncHandler(async(req,res)=>{const r=await query(`SELECT rr.*,e.fecha_hora,e.punto_acceso,e.imagen_url FROM resultados_reconocimiento_placa rr JOIN eventos_acceso e ON e.id=rr.evento_acceso_id ORDER BY rr.creado_en DESC LIMIT 300`);res.json(r.rows)}));

// Lectura OCR en servidor: imagen real, evidencia y confianza derivada de TSV.
async function leerPlaca(data){
 if(typeof data!=='string'||!/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(data)||data.length>2400000)throw Object.assign(new Error('Cargue una imagen JPG, PNG o WebP (hasta 1,7 MB).'),{status:400});
 const dir=await mkdtemp(path.join(tmpdir(),'parkia-ocr-'));
 try{
  const ext=data.startsWith('data:image/png')?'png':data.startsWith('data:image/webp')?'webp':'jpg';
  const file=path.join(dir,'placa.'+ext);await writeFile(file,Buffer.from(data.split(',')[1],'base64'));
  const output=await new Promise((resolve,reject)=>{const proc=spawn('tesseract',[file,'stdout','--psm','7','-l','eng','tsv']);let chunks='',errors='';proc.stdout.on('data',d=>chunks+=d);proc.stderr.on('data',d=>errors+=d);proc.on('error',reject);proc.on('close',code=>code===0?resolve(chunks):reject(new Error('OCR no disponible: '+errors.slice(0,140))))});
  const lines=output.trim().split('\n').slice(1).map(x=>x.split('\t')).filter(x=>x.length>=12&&Number(x[10])>=0&&x[11].trim());
  const raw=lines.map(x=>x[11]).join('').toUpperCase().replace(/[^A-Z0-9]/g,'');
  const score=lines.length?Math.round(lines.reduce((a,x)=>a+Number(x[10]),0)/lines.length):0;
  return {placa:/^[A-Z0-9]{4,12}$/.test(raw)?raw:null,confianza:score,texto:raw};
 }finally{await rm(dir,{recursive:true,force:true})}
}
accesosRouter.post('/leer-placa',requirePermission('acceso.validar'),asyncHandler(async(req,res)=>{
 const ocr=await leerPlaca(req.body?.imagen);
 const confiable=!!ocr.placa&&ocr.confianza>=85;
 const rv=confiable?await transaction(c=>resolverVehiculo(c,ocr.placa)):{vehiculoId:null,resultado:'INCIERTO'};
 res.json({...ocr,resultado:confiable?rv.resultado:'INCIERTO',requiereRevision:!confiable,umbral:85});
}));
accesosRouter.post('/registrar-lectura',requirePermission('acceso.validar'),asyncHandler(async(req,res)=>{
 const b=req.body||{};
 if(!['INGRESO','SALIDA'].includes(b.tipoEvento))return res.status(400).json({message:'Indique ingreso o salida.'});
 if(!b.imagen)return res.status(400).json({message:'Debe adjuntar evidencia visual real.'});
 const ocr=await leerPlaca(b.imagen);const seguro=ocr.placa&&ocr.confianza>=85;
 const rv=seguro?await transaction(c=>resolverVehiculo(c,ocr.placa)):{vehiculoId:null,resultado:'INCIERTO'};
 const ev=await transaction(async c=>{
  const cam=await c.query(`SELECT id FROM dispositivos WHERE tipo_dispositivo='CAMARA_ACCESO_LPR' ORDER BY codigo LIMIT 1`);
  const r=await c.query(`INSERT INTO eventos_acceso(tipo_evento,punto_acceso,camara_acceso_id,placa_detectada,vehiculo_id,imagen_url,confianza_reconocimiento,resultado_validacion,autorizado_manual,observaciones,origen,evidencia_tipo) VALUES($1,$2,$3,$4,$5,$6,$7,$8,FALSE,$9,'CAMARA_IA','IMAGEN_REAL') RETURNING *`,[b.tipoEvento,String(b.puntoAcceso||'PORTERIA').slice(0,120),b.camaraId||cam.rows[0]?.id||null,ocr.placa,rv.vehiculoId,b.imagen,ocr.confianza,rv.resultado,seguro?'OCR procesado':'Revisión obligatoria por lectura incierta']);
  await c.query(`INSERT INTO resultados_reconocimiento_placa(evento_acceso_id,placa_detectada,confianza,resultado_crudo,estado_validacion) VALUES($1,$2,$3,$4,$5)`,[r.rows[0].id,ocr.placa,ocr.confianza,JSON.stringify({texto:ocr.texto,umbral:85,evidencia:'REAL'}),seguro?'AUTOMATICO':'RECHAZADO']);
  return r.rows[0];
 });
 await registrarAuditoria({usuarioId:req.user.sub,accion:'LECTURA_LPR',entidad:'eventos_acceso',entidadId:ev.id,detalle:{resultado:ev.resultado_validacion,confianza:ocr.confianza},req});
 res.status(201).json({id:ev.id,placa:ocr.placa,confianza:ocr.confianza,resultado:ev.resultado_validacion,requiereRevision:!seguro});
}));
accesosRouter.post('/eventos/:id/revision-manual',requirePermission('acceso.validar'),asyncHandler(async(req,res)=>{
 if(!/^[0-9a-f-]{36}$/i.test(req.params.id))return res.status(400).json({message:'ID inválido'});
 const placa=String(req.body?.placa||'').trim().toUpperCase().replace(/[ -]/g,'');
 const motivo=String(req.body?.motivo||'').trim();
 if(!/^[A-Z0-9]{4,12}$/.test(placa)||motivo.length<10)return res.status(400).json({message:'Indique placa válida y motivo detallado (mínimo 10 caracteres).'});
 const ev=await transaction(async c=>{
  const old=await c.query('SELECT * FROM eventos_acceso WHERE id=$1 FOR UPDATE',[req.params.id]);
  if(!old.rowCount)throw Object.assign(new Error('Evento inexistente'),{status:404});
  if(old.rows[0].resultado_validacion!=='INCIERTO'&&old.rows[0].resultado_validacion!=='DENEGADO')throw Object.assign(new Error('Sólo se revisan eventos inciertos o denegados.'),{status:409});
  if(old.rows[0].autorizado_manual)throw Object.assign(new Error('Evento ya revisado'),{status:409});
  const autorizado=await resolverVehiculo(c,placa);
  // La intervención humana nunca omite las autorizaciones vigentes.
  const r=await c.query(`UPDATE eventos_acceso SET placa_detectada=$2,vehiculo_id=$3,resultado_validacion=$4,autorizado_manual=TRUE,autorizado_por=$5,observaciones=$6 WHERE id=$1 RETURNING *`,[req.params.id,placa,autorizado.vehiculoId,autorizado.resultado==='AUTORIZADO'?'MANUAL':'DENEGADO',req.user.sub,motivo]);
  await c.query(`UPDATE resultados_reconocimiento_placa SET estado_validacion='MANUAL_CORREGIDO',placa_corregida=$2,validado_por=$3,validado_en=NOW() WHERE evento_acceso_id=$1`,[req.params.id,placa,req.user.sub]);
  return r.rows[0];
 });
 await registrarAuditoria({usuarioId:req.user.sub,accion:'REVISION_MANUAL_ACCESO',entidad:'eventos_acceso',entidadId:ev.id,detalle:{placa,resultado:ev.resultado_validacion,motivo},req});
 res.json({id:ev.id,resultado:ev.resultado_validacion,placa:ev.placa_detectada});
}));
