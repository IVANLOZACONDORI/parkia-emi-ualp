import { api, sesion } from './api.js';

let captchaToken = '';
let countdownTimer = null;

const q = document.getElementById('captchaQuestion');
const err = document.getElementById('error');
const statusBox = document.getElementById('status');
const form = document.getElementById('loginForm');
const userInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const captchaInput = document.getElementById('captchaAnswer');
const reloadButton = document.getElementById('reloadCaptcha');
const loginButton = document.getElementById('loginButton');
const loginButtonText = document.getElementById('loginButtonText');
const loginSpinner = document.getElementById('loginSpinner');
const togglePassword = document.getElementById('togglePassword');
const capsWarning = document.getElementById('capsWarning');

function setLoading(loading) {
  loginButton.disabled = loading;
  reloadButton.disabled = loading;
  userInput.readOnly = loading;
  passwordInput.readOnly = loading;
  captchaInput.readOnly = loading;
  loginButtonText.textContent = loading ? 'VALIDANDO...' : 'INGRESAR AL SISTEMA';
  loginSpinner.classList.toggle('hidden', !loading);
}

function hideMessages() {
  err.classList.add('hidden');
  statusBox.classList.add('hidden');
}

function showError(message) {
  err.textContent = message;
  err.classList.remove('hidden');
  statusBox.classList.add('hidden');
}

function showStatus(message) {
  statusBox.textContent = message;
  statusBox.classList.remove('hidden');
  err.classList.add('hidden');
}

async function cargarCaptcha() {
  clearInterval(countdownTimer);
  captchaToken = '';
  captchaInput.value = '';
  q.textContent = 'Cargando...';
  reloadButton.disabled = true;
  try {
    const c = await api('/autenticacion/captcha', { auth: false });
    captchaToken = c.token;
    q.textContent = c.question;
  } catch {
    q.textContent = 'No disponible';
    showError('No se pudo generar el CAPTCHA. Intente nuevamente.');
  } finally {
    reloadButton.disabled = false;
  }
}

function iniciarCuentaRegresiva(segundos) {
  clearInterval(countdownTimer);
  let restante = Math.max(1, Number(segundos || 0));
  const pintar = () => {
    const min = Math.floor(restante / 60);
    const seg = restante % 60;
    showError(`Cuenta temporalmente bloqueada. Intente nuevamente en ${min}:${String(seg).padStart(2, '0')}.`);
    restante -= 1;
    if (restante < 0) {
      clearInterval(countdownTimer);
      showStatus('El tiempo de bloqueo terminó. Puede intentar iniciar sesión nuevamente.');
      cargarCaptcha();
    }
  };
  pintar();
  countdownTimer = setInterval(pintar, 1000);
}

reloadButton.addEventListener('click', () => {
  hideMessages();
  cargarCaptcha();
});

togglePassword.addEventListener('click', () => {
  const showing = passwordInput.type === 'text';
  passwordInput.type = showing ? 'password' : 'text';
  togglePassword.textContent = showing ? 'Mostrar' : 'Ocultar';
  togglePassword.setAttribute('aria-label', showing ? 'Mostrar contraseña' : 'Ocultar contraseña');
  togglePassword.setAttribute('aria-pressed', String(!showing));
  passwordInput.focus();
});

passwordInput.addEventListener('keyup', e => {
  capsWarning.classList.toggle('hidden', !e.getModifierState?.('CapsLock'));
});
passwordInput.addEventListener('blur', () => capsWarning.classList.add('hidden'));

form.addEventListener('submit', async e => {
  e.preventDefault();
  hideMessages();

  const nombreUsuario = userInput.value.trim();
  const contrasena = passwordInput.value;
  const captchaRespuesta = captchaInput.value.trim();

  if (!nombreUsuario || !contrasena || !captchaRespuesta) {
    showError('Complete usuario, contraseña y CAPTCHA para continuar.');
    return;
  }
  if (!captchaToken) {
    showError('El CAPTCHA no está disponible. Genere uno nuevo e intente otra vez.');
    await cargarCaptcha();
    return;
  }

  setLoading(true);
  try {
    const data = await api('/autenticacion/login', {
      method: 'POST',
      auth: false,
      body: { nombreUsuario, contrasena, captchaToken, captchaRespuesta }
    });
    sesion.guardar(data);
    showStatus('Acceso correcto. Ingresando al sistema...');
    location.replace('/sistema');
  } catch (ex) {
    if (ex.status === 423 && ex.data?.retryAfterSeconds) {
      iniciarCuentaRegresiva(ex.data.retryAfterSeconds);
    } else {
      showError(ex.message || 'No fue posible iniciar sesión.');
      await cargarCaptcha();
    }
    passwordInput.select();
  } finally {
    setLoading(false);
  }
});

async function iniciar() {
  if (sesion.token) {
    try {
      const data = await api('/autenticacion/yo');
      sesion.actualizarUsuario(data.usuario);
      location.replace('/sistema');
      return;
    } catch {
      sesion.limpiar();
    }
  }
  userInput.focus();
  await cargarCaptcha();
}

iniciar();
