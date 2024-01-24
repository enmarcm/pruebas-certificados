import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

/**
 * Importa un archivo JSON utilizando la ruta proporcionada.
 * @param {Object} options - Un objeto que contiene la ruta del archivo JSON a importar.
 * @param {string} options.path - La ruta del archivo JSON a importar.
 * @returns {Object} - El objeto JSON importado.
 */
const importJson = ({ path }) => {
    try {
        return require(path)
    } catch (error) {
        return {error}
    }
};

export default importJson;