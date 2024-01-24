import fs from "node:fs/promises";
import https from "node:https";

/**
 * Clase para hacer uso del cliente https de node
 */
class HttpClient {
  /**
   * Crea un HttpClient.
   * @param {Object} options - Las opciones para el HttpClient.
   * @param {string} options.keyRoute - La ruta relativa desde la carpeta raíz hasta el archivo de la clave privada.
   * @param {string} options.certRoute - La ruta relativa desde la carpeta raíz hasta el archivo del certificado.
   */
  constructor({ keyRoute, certRoute }) {
    this.keyRoute = keyRoute;
    this.certRoute = certRoute;
    this.options = null;
    this.#obtainData();
  }

  /**
   * Método privado para cargar la clave privada y el certificado desde las rutas especificadas.
   * @private
   */
  #obtainData = async () => {
    try {
      const key = await fs.readFile(this.keyRoute);
      const cert = await fs.readFile(this.certRoute);

      this.options = {
        key,
        cert,
      };
    } catch (error) {
      throw error
    }
  };

  /**
   * Método para iniciar el servidor.
   * @param {Object} params - Los parámetros para el método listenServer.
   * @param {express.Application} params.app - La aplicación Express.
   * @param {Function} params.listen - La función que se ejecutará cuando el servidor esté escuchando.
   * @param {number} params.PORT - El puerto en el que se iniciará el servidor.
   * @returns {https.Server} El servidor HTTPS creado.
   */
  listenServer = async ({ app, listen, PORT }) => {
    if (!this.options) await this.#obtainData();

    const server = https.createServer(this.options, app);
    const serverListen = server.listen(PORT, listen);

    return serverListen;
  };
}

export default HttpClient;
