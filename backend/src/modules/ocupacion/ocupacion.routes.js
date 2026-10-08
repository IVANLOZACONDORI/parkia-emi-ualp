import { Router } from 'express';
import sharp from 'sharp';
import { query } from '../../config/db.js';
import { authenticate, requirePermission } from '../../middleware/auth.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const ocupacionRouter = Router();
ocupacionRouter.use(authenticate);
const safeId = id => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(id || ''));
let migrated = false;
async function ensureSchema(){
  if(migrated)return;
  await query(`CREATE TABLE IF NOT EXISTS ocupacion_calibraciones (
    plaza_id UUID PRIMARY KEY REFERENCES plazas_parqueo(id) ON DELETE CASCADE,
    roi JSONB NOT NULL, referencia_libre TEXT, referencia_ocupada TEXT,
    actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(), actualizado_por UUID)`);
  await query(`CREATE TABLE IF NOT EXISTS ocupacion_evaluaciones (
    id BIGSERIAL PRIMARY KEY, plaza_id UUID NOT NULL REFERENCES plazas_parqueo(id),
    estado_predicho VARCHAR(20) NOT NULL, confianza NUMERIC(5,2),
    distancia_libre NUMERIC(10,5), distancia_ocupada NUMERIC(10,5),
    evidencia TEXT, observacion VARCHAR(200), creado_en TIMESTAMPTZ DEFAULT NOW())`);
  await query('CREATE INDEX IF NOT EXISTS ix_ocupacion_evaluaciones_fecha ON ocupacion_evaluaciones(plaza_id,creado_en DESC)');
  migrated = true;
}
function parseImage(data){
  if(typeof data !== 'string' || !/^data:image\/(jpeg|png|webp);base64,/i.test(data))throw Object.assign(new Error('Solo imágenes JPG, PNG o WebP.'),{status:400});
  const raw = data.substring(data.indexOf(',')+1);
  if(raw.length > 8_000_000 || !/^[A-Za-z0-9+/]+={0,2}$/.test(raw))throw Object.assign(new Error('Imagen inválida o demasiado grande (máximo 6 MB).'),{status:400});
  return Buffer.from(raw,'base64');
}
function roiValid(r){return r && ['x','y','w','h'].every(k=>Number.isFinite(Number(r[k]))&&Number(r[k])>=0&&Number(r[k])<=1)&&Number(r.w)>.05&&Number(r.h)>.05&&Number(r.x)+Number(r.w)<=1.001&&Number(r.y)+Number(r.h)<=1.001;}
async function feature(data,roi){
  const input=parseImage(data);const meta=await sharp(input,{limitInputPixels:20_000_000}).metadata();
  if(!meta.width||!meta.height||meta.width<80||meta.height<60)throw Object.assign(new Error('La imagen debe ser más grande.'),{status:400});
  const left=Math.min(meta.width-2,Math.round(roi.x*meta.width)),top=Math.min(meta.height-2,Math.round(roi.y*meta.height));
  const width=Math.max(2,Math.min(meta.width-left,Math.round(roi.w*meta.width))),height=Math.max(2,Math.min(meta.height-top,Math.round(roi.h*meta.height)));
  // Gradientes locales estabilizan parte de los cambios globales de iluminación; no sustituyen pruebas de campo.
  const {data:pix,info}=await sharp(input).extract({left,top,width,height}).greyscale().normalize().resize(32,32,{fit:'fill'}).raw().toBuffer({resolveWithObject:true});
  const v=[]; for(let y=1;y<31;y+=2)for(let x=1;x<31;x+=2){const i=y*info.width+x;v.push(Math.min(255,Math.abs(pix[i]-pix[i-1])+Math.abs(pix[i]-pix[i-info.width]))/255);}
  return v;
}
function distance(a,b){if(!a||!b||a.length!==b.length)throw new Error('Referencias incompatibles. Recalibre la plaza.');return a.reduce((s,v,i)=>s+Math.abs(v-b[i]),0)/a.length;}
async function getPlaza(id){if(!safeId(id))throw Object.assign(new Error('Identificador de plaza inválido.'),{status:400});const r=await query('SELECT id,codigo,camara_id,habilitada FROM plazas_parqueo WHERE id=$1',[id]);if(!r.rowCount)throw Object.assign(new Error('Plaza inexistente.'),{status:404});return r.rows[0];}
function invalid(res,e){return res.status(e.status||400).json({message:e.message||'Solicitud inválida.'});}

ocupacionRouter.get('/estado',requirePermission('ocupacion.ver'),asyncHandler(async(req,res)=>{await ensureSchema();const r=await query(`SELECT p.id,p.codigo,p.tipo_plaza,p.estado_actual,p.confianza,p.actualizado_en,p.coordenada_x,p.coordenada_y,z.id zona_id,z.nombre zona_nombre,d.nombre camara_nombre,c.roi, (c.referencia_libre IS NOT NULL) calibrada_libre, (c.referencia_ocupada IS NOT NULL) calibrada_ocupada FROM plazas_parqueo p JOIN zonas_parqueo z ON z.id=p.zona_id LEFT JOIN dispositivos d ON d.id=p.camara_id LEFT JOIN ocupacion_calibraciones c ON c.plaza_id=p.id ORDER BY z.nombre,p.coordenada_y,p.coordenada_x`);res.json(r.rows)}));
ocupacionRouter.get('/historial',requirePermission('ocupacion.ver'),asyncHandler(async(req,res)=>{await ensureSchema();const id=req.query.plazaId;if(id && !safeId(id))return res.status(400).json({message:'Plaza inválida.'});const r=await query(`SELECT e.id,e.creado_en,e.estado_predicho,e.confianza,e.distancia_libre,e.distancia_ocupada,e.observacion,p.codigo FROM ocupacion_evaluaciones e JOIN plazas_parqueo p ON p.id=e.plaza_id WHERE ($1::uuid IS NULL OR e.plaza_id=$1::uuid) ORDER BY e.creado_en DESC LIMIT 100`,[id||null]);res.json(r.rows)}));
// Calibración: fotografiar la MISMA cámara y encuadre con la plaza libre y ocupada.
ocupacionRouter.post('/calibrar',requirePermission('ocupacion.actualizar'),asyncHandler(async(req,res)=>{try{await ensureSchema();const b=req.body;const plaza=await getPlaza(b.plazaId);if(!roiValid(b.roi))return res.status(400).json({message:'Región de interés inválida.'});const libre=await feature(b.imagenLibre,b.roi);const ocupada=await feature(b.imagenOcupada,b.roi);if(distance(libre,ocupada)<0.025)return res.status(422).json({message:'Las referencias son demasiado similares. Tome fotografías claramente diferentes.'});await query(`INSERT INTO ocupacion_calibraciones(plaza_id,roi,referencia_libre,referencia_ocupada,actualizado_en,actualizado_por) VALUES($1,$2,$3,$4,NOW(),$5) ON CONFLICT(plaza_id) DO UPDATE SET roi=EXCLUDED.roi,referencia_libre=EXCLUDED.referencia_libre,referencia_ocupada=EXCLUDED.referencia_ocupada,actualizado_en=NOW(),actualizado_por=EXCLUDED.actualizado_por`,[plaza.id,JSON.stringify(b.roi),JSON.stringify(libre),JSON.stringify(ocupada),req.user.sub]);res.json({message:'Región y referencias recalibradas.',plaza:plaza.codigo});}catch(e){invalid(res,e)}}));
// Procesamiento real de imagen y clasificación por similitud con referencias de campo; INCIERTO ante margen bajo.
ocupacionRouter.post('/procesar',requirePermission('ocupacion.actualizar'),asyncHandler(async(req,res)=>{try{await ensureSchema();const plaza=await getPlaza(req.body.plazaId);if(!plaza.habilitada)return res.status(409).json({message:'La plaza no está habilitada.'});const q=await query('SELECT * FROM ocupacion_calibraciones WHERE plaza_id=$1',[plaza.id]);if(!q.rowCount||!q.rows[0].referencia_libre||!q.rows[0].referencia_ocupada)return res.status(409).json({message:'Calibre primero esta plaza con fotografías libre y ocupada.'});const c=q.rows[0],v=await feature(req.body.imagen,c.roi),dl=distance(v,JSON.parse(c.referencia_libre)),do_=distance(v,JSON.parse(c.referencia_ocupada));const margin=Math.abs(dl-do_),nearest=Math.min(dl,do_);const certain=margin>=0.025 && nearest<=0.20;const estado=certain?(dl<do_?'LIBRE':'OCUPADA'):'INCIERTO';const confianza=certain?Math.max(50,Math.min(99,Math.round(100*margin/(dl+do_+0.0001)))):null;
await query('INSERT INTO ocupacion_evaluaciones(plaza_id,estado_predicho,confianza,distancia_libre,distancia_ocupada,observacion) VALUES($1,$2,$3,$4,$5,$6)',[plaza.id,estado,confianza,dl,do_,certain?'Clasificación por referencias calibradas':'Verificación manual necesaria: iluminación, sombras, lluvia u oclusiones posibles']);
if(certain){await query(`SELECT cambiar_estado_plaza($1,$2,$3,$4,'VISION_IA')`,[plaza.id,estado,confianza,plaza.camara_id]);}
res.json({plaza:plaza.codigo,estado,confianza,distanciaLibre:Number(dl.toFixed(4)),distanciaOcupada:Number(do_.toFixed(4)),actualizado:certain,mensaje:certain?'Estado actualizado.':'Lectura incierta: no se ha modificado el estado de la plaza.'});}catch(e){invalid(res,e)}}));
ocupacionRouter.post('/actualizar',requirePermission('ocupacion.actualizar'),asyncHandler(async(req,res)=>{const b=req.body;if(!safeId(b.plazaId)||!['LIBRE','OCUPADA','SIN_DATOS','FUERA_SERVICIO'].includes(b.estadoNuevo))return res.status(400).json({message:'Datos inválidos.'});const r=await query(`SELECT * FROM cambiar_estado_plaza($1,$2,$3,$4,'MANUAL')`,[b.plazaId,b.estadoNuevo,null,null]);res.json(r.rows[0])}));
// Simulación mantenida solo para pruebas explícitas, nunca se presenta como detección.
ocupacionRouter.post('/simular',requirePermission('ocupacion.actualizar'),asyncHandler(async(req,res)=>{const b=req.body;const p=await query('SELECT id,camara_id,estado_actual FROM plazas_parqueo WHERE codigo=UPPER($1) LIMIT 1',[b.codigoPlaza]);if(!p.rowCount)return res.status(404).json({message:'Plaza no encontrada.'});const nuevo=b.estadoNuevo||(p.rows[0].estado_actual==='LIBRE'?'OCUPADA':'LIBRE');if(!['LIBRE','OCUPADA'].includes(nuevo))return res.status(400).json({message:'Estado inválido.'});const r=await query(`SELECT * FROM cambiar_estado_plaza($1,$2,NULL,$3,'SIMULADOR')`,[p.rows[0].id,nuevo,p.rows[0].camara_id]);res.json(r.rows[0])}));
