import Mailer from "../../components/Mailer.js";
import importJson from "../../utils/importJson.js";

const config = importJson({ path: "../data/mailer-data/config.json" })

/**
 * Instancia de la clase Mailer para enviar correos electrónicos.
 * @type {Mailer}
 */
const iMailer = new Mailer({ config });

export default iMailer;