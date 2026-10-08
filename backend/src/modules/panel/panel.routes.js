import {Router} from 'express';
import {query} from '../../config/db.js';
import {authenticate,requirePermission} from '../../middleware/auth.js';
import {asyncHandler} from '../../utils/asyncHandler.js';
export const panelRouter=Router();
panelRouter.use(authenticate,requirePermission('panel.ver'));
const isUuid=v=>/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
panelRouter.get('/resumen',asyncHandler(async(req,res)=>{
 const [zonas,acceso,alertas,dispositivos,recientes]=await Promise.all([
  query(`SELECT z.id,z.codigo,z.nombre,COALESCE(v.total_plazas,0)::int total_plazas,COALESCE(v.plazas_libres,0)::int plazas_libres,COALESCE(v.plazas_ocupadas,0)::int plazas_ocupadas,COALESCE(v.plazas_fuera_servicio,0)::int plazas_fuera_servicio,COALESCE(v.plazas_sin_datos,0)::int plazas_sin_datos,COALESCE(v.porcentaje_ocupacion,0) porcentaje_ocupacion FROM zonas_parqueo z LEFT JOIN vista_disponibilidad_zonas v ON z.id=v.zona_id ORDER BY CASE WHEN z.codigo='Z-EST-TRASERA' THEN 0 ELSE 1 END,z.nombre`),
  query(`SELECT COUNT(*)::int eventos_hoy,COUNT(*) FILTER(WHERE resultado_validacion='DENEGADO')::int denegados_hoy FROM eventos_acceso WHERE fecha_hora::date=CURRENT_DATE`),
  query(`SELECT COUNT(*) FILTER(WHERE estado='ABIERTA')::int abiertas,COUNT(*) FILTER(WHERE estado='ABIERTA' AND severidad IN ('ALTA','CRITICA'))::int criticas FROM alertas`),
  query(`SELECT COUNT(*)::int total,COUNT(*) FILTER(WHERE estado='EN_LINEA')::int en_linea,COUNT(*) FILTER(WHERE estado<>'EN_LINEA')::int con_incidencia FROM dispositivos WHERE tipo_dispositivo LIKE 'CAMARA%'`),
  query(`SELECT a.id,a.titulo,a.severidad,a.estado,a.abierta_en,z.nombre zona_nombre FROM alertas a LEFT JOIN zonas_parqueo z ON z.id=a.zona_id WHERE a.estado='ABIERTA' ORDER BY CASE a.severidad WHEN 'CRITICA' THEN 0 WHEN 'ALTA' THEN 1 ELSE 2 END,a.abierta_en DESC LIMIT 8`)
 ]);
 res.json({zonas:zonas.rows,acceso:acceso.rows[0],alertas:alertas.rows[0],dispositivos:dispositivos.rows[0],alertas_recientes:recientes.rows,actualizado_en:new Date().toISOString()});
}));
panelRouter.get('/zonas/:id',asyncHandler(async(req,res)=>{
 if(!isUuid(req.params.id))return res.status(400).json({message:'Identificador de zona no válido.'});
 const [zona,plazas,dispositivos,alertas]=await Promise.all([
  query(`SELECT z.id,z.codigo,z.nombre,z.descripcion,COALESCE(v.total_plazas,0)::int total_plazas,COALESCE(v.plazas_libres,0)::int plazas_libres,COALESCE(v.plazas_ocupadas,0)::int plazas_ocupadas,COALESCE(v.plazas_fuera_servicio,0)::int plazas_fuera_servicio,COALESCE(v.plazas_sin_datos,0)::int plazas_sin_datos FROM zonas_parqueo z LEFT JOIN vista_disponibilidad_zonas v ON v.zona_id=z.id WHERE z.id=$1`,[req.params.id]),
  query(`SELECT p.id,p.codigo,p.estado_actual,p.coordenada_x,p.coordenada_y,p.actualizado_en,p.confianza FROM plazas_parqueo p WHERE p.zona_id=$1 ORDER BY p.coordenada_y,p.coordenada_x,p.codigo`,[req.params.id]),
  query(`SELECT id,codigo,nombre,tipo_dispositivo,estado,ultima_comunicacion_en FROM dispositivos WHERE zona_id=$1 AND tipo_dispositivo LIKE 'CAMARA%' ORDER BY nombre`,[req.params.id]),
  query(`SELECT a.id,a.titulo,a.severidad,a.estado,a.abierta_en,p.codigo plaza_codigo FROM alertas a LEFT JOIN plazas_parqueo p ON p.id=a.plaza_id WHERE a.zona_id=$1 AND a.estado='ABIERTA' ORDER BY a.abierta_en DESC LIMIT 30`,[req.params.id])
 ]);
 if(!zona.rowCount)return res.status(404).json({message:'Zona no encontrada.'});
 res.json({zona:zona.rows[0],plazas:plazas.rows,camaras:dispositivos.rows,alertas:alertas.rows,actualizado_en:new Date().toISOString()});
}));
