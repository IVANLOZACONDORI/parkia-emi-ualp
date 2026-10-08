import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { authenticate } from '../../middleware/auth.js';
import { createCaptcha } from './captcha.service.js';
import { cerrarSesion, iniciarSesion } from './autenticacion.service.js';

export const autenticacionRouter = Router();

autenticacionRouter.get('/captcha', (req, res) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.json(createCaptcha());
});

autenticacionRouter.post('/login', asyncHandler(async (req, res) => {
  res.set('Cache-Control', 'no-store');
  try {
    res.json(await iniciarSesion({ ...req.body, req }));
  } catch (error) {
    if (error.status === 423 && error.retryAfterSeconds) {
      res.set('Retry-After', String(error.retryAfterSeconds));
      return res.status(423).json({ message: error.message, retryAfterSeconds: error.retryAfterSeconds });
    }
    throw error;
  }
}));

autenticacionRouter.post('/logout', authenticate, asyncHandler(async (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.json(await cerrarSesion({ req }));
}));

autenticacionRouter.get('/yo', authenticate, (req, res) => {
  const { jti, ...usuario } = req.user;
  res.set('Cache-Control', 'no-store');
  res.json({ usuario });
});
