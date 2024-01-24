import nodemailer from "nodemailer";

const Hosts = {
  gmail: {
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
  },
  outlook: {
    host: "smtp.office365.com",
    port: 587,
    secure: false,
  },
};

/**
 * Clase que representa un objeto Mailer.
 */
class Mailer {
  /**
   * Crea un objeto Mailer.
   * @param {Object} options - El objeto de opciones.
   * @param {Object} options.config - El objeto de configuración.
   * @param {string} options.config.host - El host del correo electrónico.
   * @param {string} options.config.user - El usuario del correo electrónico.
   * @param {string} options.config.password - La contraseña del correo electrónico.
   */
  constructor({ config }) {
    this.host = config.host.toLowerCase();
    this.user = config.user.toLowerCase();
    this.password = config.password;

    this.mailHost = Hosts[this.host].host;
    this.port = Hosts[this.host].port;
    this.secure = Hosts[this.host].secure;

    try {
      /**
       * El objeto transporter de nodemailer.
       * @type {Object}
       */
      this.transporter = nodemailer.createTransport({
        host: this.mailHost,
        port: this.port,
        secure: this.secure,
        auth: {
          user: this.user,
          pass: this.password,
        },
        tls: {
          // no fallar en certificados inválidos
          rejectUnauthorized: false,
        },
      });
    } catch (error) {
      console.error(error);
      this.transporter = null;
    }
  }

  /**
   * Envía un correo electrónico.
   * @async
   * @param {Object} options - El objeto de opciones.
   * @param {string} options.to - El destinatario del correo electrónico.
   * @param {string} options.subject - El asunto del correo electrónico.
   * @param {string} options.text - El cuerpo del correo electrónico.
   * @returns {Promise<Object>} El resultado del envío del correo electrónico.
   */
  sendMail = async ({ to, subject, text }) => {
    try {
      const result = await this.transporter.sendMail({
        from: this.user,
        to,
        subject,
        text,
      });

      return result;
    } catch (error) {
      return { error };
    }
  };
}

export default Mailer;