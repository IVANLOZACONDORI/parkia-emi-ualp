import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';

export function createCaptcha() {
  const a = 2 + Math.floor(Math.random() * 8);
  const b = 1 + Math.floor(Math.random() * 9);
  const op = Math.random() > 0.5 ? '+' : '-';
  const left = op === '-' ? Math.max(a,b) : a;
  const right = op === '-' ? Math.min(a,b) : b;
  const answer = op === '+' ? left + right : left - right;
  const token = jwt.sign({ answer, type: 'captcha' }, env.captchaSecret, { expiresIn: env.captchaExpiresIn });
  return { token, question: `${left} ${op} ${right} = ?` };
}

export function verifyCaptcha(token, answer) {
  try {
    const payload = jwt.verify(token, env.captchaSecret);
    return payload.type === 'captcha' && Number(answer) === Number(payload.answer);
  } catch {
    return false;
  }
}
