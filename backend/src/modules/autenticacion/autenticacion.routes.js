import {Router} from 'express';import {asyncHandler} from '../../utils/asyncHandler.js';import {authenticate} from '../../middleware/auth.js';import {createCaptcha} from './captcha.service.js';import {iniciarSesion} from './autenticacion.service.js';
export const autenticacionRouter=Router();
autenticacionRouter.get('/captcha',(req,res)=>res.json(createCaptcha()));
autenticacionRouter.post('/login',asyncHandler(async(req,res)=>res.json(await iniciarSesion({...req.body,req}))));
autenticacionRouter.get('/yo',authenticate,(req,res)=>res.json({usuario:req.user}));
