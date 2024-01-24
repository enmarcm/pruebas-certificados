import midCors from "./midCors.js";
import midNotFound from "./midNotFound.js";
import midJson from "./midJson.js";
import cors from "cors";
import httpToS from "./httpToS.js";

/**
 * Middleware para permitir el acceso a recursos de diferentes orígenes.
 * @type {Function}
 */
export { midCors };

/**
 * Middleware para manejar solicitudes a rutas no encontradas.
 * @type {Function}
 */
export { midNotFound };

/**
 * Middleware para verificar el schema de los JSON en el body.
 * @type {Function}
 */
export { midJson };

/**
 * Midleware de libreria cors
 * @type {Function}
 */
export { cors };

/**
 * Middleware para redireccionar a HTTPS.
 * @type {Function}
 */
export { httpToS };
