import {query} from '../../config/db.js';import {hashPassword} from '../../utils/security.js';
const usuariosDemo=[
 ['admin','PARKIA2026!Admin','Administrador PARKIA','admin@emi.edu.bo','TIC','ADMINISTRADOR_SISTEMA',null],
 ['director','PARKIA2026!Dir','Director de Grado','director@emi.edu.bo','Dirección de Grado','DIRECCION_GRADO',null],
 ['operaciones','PARKIA2026!Ops','Jefe de Operaciones','operaciones@emi.edu.bo','Operaciones','JEFE_OPERACIONES',null],
 ['guardia','PARKIA2026!Seg','Personal de Guardia','guardia@emi.edu.bo','Seguridad','PERSONAL_GUARDIA',null],
 ['soporte','PARKIA2026!Tic','Soporte TIC','tic@emi.edu.bo','TIC','SOPORTE_TIC',null],
 ['infraestructura','PARKIA2026!Infra','Unidad de Infraestructura','infra@emi.edu.bo','Infraestructura','INFRAESTRUCTURA',null],
 ['rrhh','PARKIA2026!RRHH','Consulta RRHH','rrhh@emi.edu.bo','Recursos Humanos','RECURSOS_HUMANOS',null],
 ['estudiante','PARKIA2026!Est','Estudiante de demostración','estudiante@est.emi.edu.bo','Estudiantes','ESTUDIANTE','Z-EST-TRASERA']
];
export async function asegurarUsuariosDemo(){for(const [nombreUsuario,contrasena,nombreCompleto,correo,area,codigoRol,codigoZona] of usuariosDemo){const existe=await query('SELECT 1 FROM usuarios WHERE nombre_usuario=$1',[nombreUsuario]);if(existe.rowCount)continue;const rol=await query('SELECT id FROM roles WHERE codigo=$1',[codigoRol]);if(!rol.rowCount)continue;let zonaId=null;if(codigoZona){const z=await query('SELECT id FROM zonas_parqueo WHERE codigo=$1',[codigoZona]);zonaId=z.rows[0]?.id||null}await query(`INSERT INTO usuarios(nombre_usuario,hash_contrasena,nombre_completo,correo,area_institucional,rol_id,zona_asignada_id) VALUES($1,$2,$3,$4,$5,$6,$7)`,[nombreUsuario,hashPassword(contrasena),nombreCompleto,correo,area,rol.rows[0].id,zonaId])}}
