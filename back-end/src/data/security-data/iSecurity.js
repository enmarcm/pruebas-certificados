import importJSON from "../../utils/importJson.js";
import PermissionController from "../../controllers/permissionController.js";
import Security from "../../components/Security.js";

const configSecurity = importJSON({
  path: "../data/security-data/config-security.json",
});

/**
 * Instancia de la clase Security para manejar la seguridad de la aplicación.
 * @type {Security}
 */
const iSecurity = new Security({
  controller: PermissionController,
  config: configSecurity,
});

export default iSecurity;
