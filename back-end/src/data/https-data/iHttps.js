import HttpClient from "../../components/HttpsClient.js";

/**
 * Ruta relativa desde la carpeta raíz hasta el archivo de la clave privada.
 * @type {string}
 */
const keyRoute = "src/data/certificates/key.pem";

/**
 * Ruta relativa desde la carpeta raíz hasta el archivo del certificado.
 * @type {string}
 */
const certRoute = "src/data/certificates/cert.pem";

/**
 * Instancia de HttpClient.
 * @type {HttpClient}
 */
const iHttps = new HttpClient({ keyRoute, certRoute });

export default iHttps;
