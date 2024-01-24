import Session from "../../components/Session.js";
import importJSON from "../../utils/importJson.js";

const configSession = importJSON({
  path: "../data/session-data/config-session.json",
});

/**
 * Instancia de la clase Session para manejar las sesiones de la aplicación.
 * @type {Session}
 */
const iSession = new Session({ config: configSession });

export default iSession;