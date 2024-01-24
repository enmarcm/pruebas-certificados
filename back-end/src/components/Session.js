import session from "express-session";

/**
 * Clase que maneja la creación y verificación de sesiones de usuario.
 */
class Session {
  /**
   * Constructor de la clase session
   * @param {Object} objConfig - Objeto que contiene configuracion
   * @param {Object} objConfig.config - Objeto de configuracion de la sesion
   */
  constructor({ config }) {
    /**
     * Objeto de configuracion de la sesion.
     * @type {Object}
     */
    this.config = config;
    /**
     * Objeto de sesion de express-session.
     * @type {Object}
     */
    this.session = session(config);
  }

  /**
   * Middleware para cargar la sesión en la petición.
   * @param {Object} req - Objeto de petición HTTP.
   * @param {Object} res - Objeto de respuesta HTTP.
   * @param {Function} next - Función para pasar al siguiente middleware.
   */
  loadSession = (req, res, next) => this.session(req, res, next);

  /**
   * Crea una sesión para el usuario.
   * @param {Object} options - Opciones para la creación de la sesión.
   * @param {Object} options.req - Objeto de petición HTTP.
   * @param {Object} options.infoUser - Información del usuario para la creación de la sesión.
   * @returns {boolean} - true si se creó la sesión, false si no se creó la sesión.
   */
  createSesion = ({ req, infoUser }) => {
    if (this.sessionExist(req)) return false;

    for (const key in infoUser) {
      req.session[key] = infoUser[key];
    }

    return true;
  };

  /**
   * Destruye la sesión del usuario.
   * @param {Object} req - Objeto de petición HTTP.
   * @returns {boolean} - true si se destruyó la sesión, false si no se destruyó la sesión.
   */
  destroySession = (req) => {
    if (!this.sessionExist(req)) return false;

    req.session.destroy();
    return true;
  };

  /**
   * Destruye la sesión del usuario usada para recuperacion de información.
   * @param {Object} req - Objeto de petición HTTP.
   * @returns {boolean} - true si se destruyó la sesión, false si no se destruyó la sesión.
   */
  destroySessionRecovery = (req) => {
    req.session.destroy();
    return true;
  };

  /**
   * Verifica si una sesión ya existe en la petición.
   * @param {Object} req - Objeto de petición HTTP.
   * @returns {boolean} - true si la sesión existe, false si no existe.
   */
  sessionExist = (req) =>
    req.session && req.session.user && req.session.email ? true : false;

  /**
   * Middleware para verificar si existe una sesión en la petición.
   * @param {Object} req - Objeto de petición HTTP.
   * @param {Object} res - Objeto de respuesta HTTP.
   * @param {Function} next - Función para pasar al siguiente middleware.
   */
  midSessionExist = (req, res, next) => {
    if (this.sessionExist(req)) return next();
    return res.status(401).json({ error: "No tienes sesion activa" });
  };

  /**
   * Actualiza la sesión del usuario.
   * @param {Object} options - Opciones para la actualización de la sesión.
   * @param {Object} options.req - Objeto de petición HTTP.
   * @param {Object} options.infoUser - Información del usuario para la actualización de la sesión.
   * @returns {boolean} - true si se actualizó la sesión, false si no se actualizó la sesión.
   */
  updateSession = ({ req, infoUser }) => {
    try {
      if (!this.sessionExist(req)) return false;

      for (const key in infoUser) {
        req.session[key] = infoUser[key];
      }

      return true;
    } catch (error) {
      return { error };
    }
  };
}

export default Session;
