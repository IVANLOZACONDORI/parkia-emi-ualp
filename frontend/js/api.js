const API = '/api';

export const sesion = {
  get token() { return localStorage.getItem('parkia_token'); },
  get usuario() {
    try { return JSON.parse(localStorage.getItem('parkia_usuario') || 'null'); }
    catch { return null; }
  },
  guardar(data) {
    localStorage.setItem('parkia_token', data.token);
    localStorage.setItem('parkia_usuario', JSON.stringify(data.usuario));
  },
  actualizarUsuario(usuario) {
    localStorage.setItem('parkia_usuario', JSON.stringify(usuario));
  },
  limpiar() {
    localStorage.removeItem('parkia_token');
    localStorage.removeItem('parkia_usuario');
  }
};

export async function api(ruta, { method = 'GET', body, auth = true, headers = {} } = {}) {
  const h = { 'Content-Type': 'application/json', ...headers };
  if (auth && sesion.token) h.Authorization = `Bearer ${sesion.token}`;

  let r;
  try {
    r = await fetch(`${API}${ruta}`, {
      method,
      headers: h,
      cache: 'no-store',
      body: body === undefined ? undefined : JSON.stringify(body)
    });
  } catch {
    const e = new Error('No se pudo conectar con el sistema. Verifique la red e intente nuevamente.');
    e.status = 0;
    e.data = null;
    throw e;
  }

  let data;
  try { data = await r.json(); }
  catch { data = { message: 'La respuesta recibida no es válida.' }; }

  if (!r.ok) {
    if (r.status === 401 && auth) {
      sesion.limpiar();
      if (location.pathname !== '/login') location.replace('/login');
    }
    const e = new Error(data.message || 'Error de solicitud');
    e.status = r.status;
    e.data = data;
    throw e;
  }
  return data;
}

export function tienePermiso(p) {
  const u = sesion.usuario;
  return !!u && (u.permisos?.includes('*') || u.permisos?.includes(p));
}

export function aviso(m) {
  const old = document.querySelector('.toast');
  if (old) old.remove();
  const e = document.createElement('div');
  e.className = 'toast';
  e.textContent = m;
  document.body.append(e);
  setTimeout(() => e.remove(), 3200);
}

export function fecha(v) {
  if (!v) return '-';
  return new Intl.DateTimeFormat('es-BO', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(v));
}
