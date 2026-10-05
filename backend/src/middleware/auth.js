import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export function authenticate(req,res,next){
  const header=req.headers.authorization||'';
  const token=header.startsWith('Bearer ')?header.slice(7):null;
  if(!token)return res.status(401).json({message:'Sesión no válida o ausente.'});
  try{req.user=jwt.verify(token,env.jwtSecret);next();}
  catch{return res.status(401).json({message:'La sesión expiró o el token es inválido.'});}
}

export const requirePermission=(...requeridos)=>(req,res,next)=>{
  const permisos=new Set(req.user?.permisos||[]);
  if(permisos.has('*')||requeridos.some(p=>permisos.has(p)))return next();
  return res.status(403).json({message:'No tiene permisos para realizar esta acción.'});
};
