import { api, sesion, tienePermiso } from './api.js';
import { renderPanel } from './pages/panel.js';
import { renderEstudiante } from './pages/estudiante.js';
import { renderVehiculos } from './pages/vehiculos.js';
import { renderAccesos } from './pages/accesos.js';
import { renderParqueos } from './pages/parqueos.js';
import { renderOcupacion } from './pages/ocupacion.js';
import { renderAlertas } from './pages/alertas.js';
import { renderHistorial } from './pages/historial.js';
import { renderReportes } from './pages/reportes.js';
import { renderUsuarios } from './pages/usuarios.js';
import { renderAuditoria } from './pages/auditoria.js';
import { renderRespaldos } from './pages/respaldos.js';

const c = document.getElementById('content');
const menu = document.getElementById('menu');

async function cerrarSesion() {
  const boton = document.getElementById('logout');
  boton.disabled = true;
  boton.textContent = 'Saliendo...';
  try {
    if (sesion.token) await api('/autenticacion/logout', { method: 'POST' });
  } catch {
    // Aunque la red falle, las credenciales locales se eliminan.
  } finally {
    sesion.limpiar();
    location.replace('/login');
  }
}

async function validarSesion() {
  if (!sesion.token) {
    location.replace('/login');
    return null;
  }
  try {
    const data = await api('/autenticacion/yo');
    sesion.actualizarUsuario(data.usuario);
    return data.usuario;
  } catch {
    sesion.limpiar();
    location.replace('/login');
    return null;
  }
}

async function iniciarAplicacion() {
  const u = await validarSesion();
  if (!u) return;

  document.getElementById('userName').textContent = u.nombreCompleto;
  document.getElementById('userRole').textContent = u.nombreRol;
  document.getElementById('avatar').textContent = (u.nombreCompleto || 'U').trim().charAt(0).toUpperCase();

  const modulos = [
    { id:'mi-parqueo', label:'Mi parqueo', icon:'P', perm:'estudiante.mi_parqueo', grupo:'ESTUDIANTE', render:()=>renderEstudiante(c) },
    { id:'panel', label:'Panel principal', icon:'▦', perm:'panel.ver', grupo:'SUPERVISIÓN', render:()=>renderPanel(c,u) },
    { id:'vehiculos', label:'Vehículos y autorizaciones', icon:'🚘', perm:'vehiculos.ver', grupo:'OPERACIÓN', render:()=>renderVehiculos(c) },
    { id:'accesos', label:'Control de ingreso y salida', icon:'▣', perm:'acceso.ver', grupo:'OPERACIÓN', render:()=>renderAccesos(c) },
    { id:'parqueos', label:'Zonas, plazas y cámaras', icon:'P', perm:'parqueo.ver', grupo:'INFRAESTRUCTURA', render:()=>renderParqueos(c) },
    { id:'ocupacion', label:'Ocupación por visión IA', icon:'◉', perm:'ocupacion.ver', grupo:'INFRAESTRUCTURA', render:()=>renderOcupacion(c) },
    { id:'alertas', label:'Alertas', icon:'⚠', perm:'alertas.ver', grupo:'SUPERVISIÓN', render:()=>renderAlertas(c) },
    { id:'historial', label:'Historial', icon:'⌚', perm:'historial.ver', grupo:'SUPERVISIÓN', render:()=>renderHistorial(c) },
    { id:'reportes', label:'Reportes', icon:'▥', perm:'reportes.generar', grupo:'SUPERVISIÓN', render:()=>renderReportes(c) },
    { id:'usuarios', label:'Usuarios y roles', icon:'♙', perm:'usuarios.gestionar', grupo:'ADMINISTRACIÓN', render:()=>renderUsuarios(c) },
    { id:'auditoria', label:'Auditoría', icon:'✓', perm:'auditoria.ver', grupo:'ADMINISTRACIÓN', render:()=>renderAuditoria(c) },
    { id:'respaldos', label:'Respaldos', icon:'↻', perm:'respaldos.gestionar', grupo:'ADMINISTRACIÓN', render:()=>renderRespaldos(c) }
  ].filter(m => tienePermiso(m.perm));

  for (const g of [...new Set(modulos.map(m => m.grupo))]) {
    const h = document.createElement('h4');
    h.textContent = g;
    menu.append(h);
    for (const m of modulos.filter(x => x.grupo === g)) {
      const b = document.createElement('button');
      b.className = 'menu-item';
      b.dataset.id = m.id;
      b.innerHTML = `<span>${m.icon}</span><span>${m.label}</span>`;
      b.onclick = () => navegar(m);
      menu.append(b);
    }
  }

  async function navegar(m) {
    if (!m) return;
    document.querySelectorAll('.menu-item').forEach(x => x.classList.toggle('active', x.dataset.id === m.id));
    history.replaceState(null, '', `#${m.id}`);
    c.innerHTML = '<div class="empty">Cargando módulo...</div>';
    try {
      await m.render();
    } catch (e) {
      c.innerHTML = `<div class="card panel"><h3>No se pudo cargar el módulo</h3><p>${e.message}</p></div>`;
    }
    document.getElementById('sidebar').classList.remove('open');
  }

  const wanted = location.hash.slice(1);
  const initial = modulos.find(m => m.id === wanted) || modulos[0];
  if (initial) navegar(initial);
  else c.innerHTML = '<div class="card panel"><h3>Sin módulos asignados</h3><p>Contacte al administrador del sistema.</p></div>';

  document.getElementById('logout').onclick = cerrarSesion;
  document.getElementById('menuBtn').onclick = () => document.getElementById('sidebar').classList.toggle('open');
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});
}

iniciarAplicacion();
