/**
 * Middleware para manejar solicitudes a rutas no encontradas.
 * @param {Object} req - El objeto de solicitud HTTP.
 * @param {Object} res - El objeto de respuesta HTTP.
 * @param {Function} next - La función para pasar el control al siguiente middleware.
 * @returns {void} No devuelve nada.
 */
const midNotFound = (req, res, next) => {
    res.status(404).json({ error: 'Not Found' });
    next();     
}

export default midNotFound;