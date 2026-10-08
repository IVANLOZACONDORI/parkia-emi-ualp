import { Router } from 'express';
import { query } from '../../config/db.js';
import { authenticate, requirePermission } from '../../middleware/auth.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const estudianteRouter = Router();
estudianteRouter.use(authenticate, (req, res, next) => {
  // El rol debe ser ESTUDIANTE además de poseer el permiso pertinente.
  if (req.user.rol !== 'ESTUDIANTE' && !req.user.zonaAsignadaId) return res.status(403).json({message:'No tiene una zona asignada para esta consulta. Use el panel de supervisión.'});
  next();
}, requirePermission('estudiante.mi_parqueo','parqueo.ver'));

estudianteRouter.get('/mi-parqueo', asyncHandler(async (req, res) => {
  // Nunca aceptar zona o usuario desde query/body: resolver el ámbito desde la sesión vigente.
  const zonas = await query(`
    SELECT z.id,z.codigo,z.nombre,z.referencia_ubicacion
    FROM usuarios u
    JOIN zonas_parqueo z ON z.id = u.zona_asignada_id
    WHERE u.id=$1 AND u.estado='ACTIVO' AND (u.rol_id=(SELECT id FROM roles WHERE codigo='ESTUDIANTE') AND z.codigo='Z-EST-TRASERA' OR u.rol_id<>(SELECT id FROM roles WHERE codigo='ESTUDIANTE'))
    LIMIT 1`, [req.user.sub]);
  res.set('Cache-Control','no-store, private');
  if (!zonas.rowCount) return res.status(403).json({message:'La cuenta no tiene una zona habilitada para consulta. Consulte con administración.'});
  const z=zonas.rows[0];
  const plazas=await query(`
    SELECT codigo,estado_actual,coordenada_x,coordenada_y
    FROM plazas_parqueo
    WHERE zona_id=$1 AND habilitada=TRUE
    ORDER BY coordenada_y,coordenada_x,codigo`, [z.id]);
  const estados=new Set(['LIBRE','OCUPADA','FUERA_SERVICIO','SIN_DATOS']);
  const lista=plazas.rows.map(p=>({
    codigo:p.codigo,
    estado:estados.has(p.estado_actual)?p.estado_actual:'SIN_DATOS',
    x:Number(p.coordenada_x)||1,
    y:Number(p.coordenada_y)||1
  }));
  const resumen={total:lista.length,libres:0,ocupadas:0,fueraServicio:0,sinDatos:0};
  for(const plaza of lista){
    if(plaza.estado==='LIBRE') resumen.libres++;
    else if(plaza.estado==='OCUPADA') resumen.ocupadas++;
    else if(plaza.estado==='FUERA_SERVICIO') resumen.fueraServicio++;
    else resumen.sinDatos++;
  }
  res.json({
    zona:{nombre:z.nombre,codigo:z.codigo,ubicacion:z.referencia_ubicacion},
    resumen,
    mensaje:resumen.libres>0?`HAY ${resumen.libres} ESPACIO${resumen.libres===1?'':'S'} DISPONIBLE${resumen.libres===1?'':'S'}`:'NO HAY ESPACIOS DISPONIBLES',
    plazas:lista,
    actualizadoEn:new Date().toISOString(),
    actualizacionSegundos:5
  });
}));
