export function notFound(req, res) {
  res.status(404).json({ message: 'Recurso no encontrado.' });
}

export function errorHandler(err, req, res, next) {
  console.error(err);
  if (err.code === '23505') return res.status(409).json({ message: 'El registro ya existe o viola una restricción única.', detail: err.detail });
  if (err.code === '23503') return res.status(409).json({ message: 'No se puede completar la operación por dependencias relacionadas.', detail: err.detail });
  res.status(err.status || 500).json({ message: err.message || 'Error interno del servidor.' });
}
