import crypto from "node:crypto";
import bcrypt from "bcrypt";
import CryptoJS from "crypto-js";
import fs from "node:fs/promises";
import { Transform, pipeline } from "node:stream";
import { promisify } from "node:util";
import fsNormal from "node:fs";

const pipelineAsync = promisify(pipeline);
const MAX_BLOCK_SIZE = 501;

class CryptManager {
  /**
   * Encripta un dato utilizando bcrypt.
   * @static
   * @async
   * @param {Object} options - Opciones para la encriptación.
   * @param {string} options.dato - Dato a encriptar.
   * @param {Number} [options.saltRounds=10] - Número de rondas para la generación de saltos para la encriptación con bcrypt, por defecto 10.
   * @returns {Promise<string>} - Dato encriptado.
   */
  static encryptBcrypt = async ({ dato, saltRounds = 10 }) => {
    try {
      const datoEncriptado = await bcrypt.hash(dato, saltRounds);
      return datoEncriptado;
    } catch (error) {
      console.error(error);
      return { error };
    }
  };

  /**
   * Compara un dato con un hash encriptado utilizando bcrypt.
   * @static
   * @async
   * @param {Object} options - Opciones para la comparación.
   * @param {string} options.dato - Dato a comparar.
   * @param {string} options.hash - Hash encriptado a comparar.
   * @returns {Promise<boolean>} - Resultado de la comparación (true si son iguales, false si no lo son).
   */
  static compareBcrypt = async ({ dato, hash }) => {
    try {
      const resultado = await bcrypt.compare(dato, hash);
      return resultado;
    } catch (error) {
      return { error };
    }
  };

  /**
   * Genera una cadena aleatoria de caracteres hexadecimales.
   * @static
   * @param {Object} [options] - Opciones de la generación.
   * @param {number} [options.size=8] - Tamaño de la cadena generada.
   * @returns {string} - Cadena aleatoria de caracteres hexadecimales.
   */
  static generarRandom = ({ size = 8 } = {}) => {
    const random = crypto.randomBytes(8).toString("hex");
    const randomElement = random.slice(0, size);

    return randomElement;
  };

  /**
   * Encripta un dato utilizando el algoritmo AES y una llave predefinida.
   * @param {Object} options - Opciones para la encriptación.
   * @param {string} options.dato - El dato a encriptar.
   * @param {string} options.keyUncrypt - La llave para encriptar el dato.
   * @returns {string} El dato encriptado.
   */
  static simetrycEncrypt = ({ dato, keyUncrypt }) => {
    const ciphertext = CryptoJS.AES.encrypt(dato, keyUncrypt).toString();

    return ciphertext;
  };

  /**
   * Desencripta un dato utilizando el algoritmo AES y una llave predefinida.
   * @param {Object} options - Opciones para la desencriptación.
   * @param {string} options.datoEncriptado - El dato a desencriptar.
   * @param {string} options.keyUncrypt - La llave para desencriptar el dato.
   * @returns {string} El dato desencriptado.
   */
  static simetrycDecrypt = ({ datoEncriptado, keyUncrypt }) => {
    const bytes = CryptoJS.AES.decrypt(datoEncriptado, keyUncrypt);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);

    return originalText;
  };

  /**
   * Genera una llave de uso
   * @param {Object} options - Objeto contenedor de parametro
   * @param {string} options.typeKey - Tipo de algoritmo para generar  el cifrado ["hmac | aes"]
   * @param {number} options.lengthKey - Longituden bits de la llave generada, si typeKey es 'aes' [128, 192, 256]. Si es 'hmac' [8 - (2^31)-1]
   * @returns {string | KeyObject | error}
   */
  static generateKey = ({ typeKey = "aes", lengthKey = 128 }) => {
    try {
      const key = crypto.generateKeySync(typeKey, { length: lengthKey });
      const keyResult = key.export().toString("hex");

      return keyResult;
    } catch (error) {
      return { error: `Existio un error ${error}` };
    }
  };

  /**
   * Genera un par de claves pública y privada.
   *
   * @static
   * @param {Object} options - Las opciones para la generación de claves.
   * @param {number} [options.modulusLength=4096] - La longitud del módulo.
   * @param {string} [options.publicType='spki'] - El tipo de codificación para la clave pública.
   * @param {string} [options.privateType='pkcs8'] - El tipo de codificación para la clave privada.
   * @param {string} [options.passphrase='top secret'] - La frase de contraseña para la clave privada.
   * @returns {Object} Un objeto que contiene la clave pública y privada, o un objeto con un error si la generación de claves falla.
   * @returns {string} [options.publicKey] - La clave pública - Tiene \n en los saltos de linea. Formatear al usar.
   * @returns {string} [options.privateKey] - La clave privada. Tiene \n en los saltos de linea. Formatear al usar.
   * @throws {Error} Si ocurre un error durante la generación de claves.
   */
  static generatePairKeys = ({
    modulusLength = 4096,
    publicType = "spki",
    privateType = "pkcs8",
  }) => {
    try {
      const options = {
        modulusLength,
        publicKeyEncoding: {
          type: publicType,
          format: "pem",
        },
        privateKeyEncoding: {
          type: privateType,
          format: "pem",
        },
      };

      const { publicKey, privateKey } = crypto.generateKeyPairSync(
        "rsa",
        options
      );
      if (!publicKey || !privateKey) return { error: "No se pudieron generar" };

      return { publicKey, privateKey };
    } catch (error) {
      return { error: `Ocurrio un error: ${error}` };
    }
  };

  /**
   * Encripta los datos con la clave pública proporcionada.
   *
   * @static
   * @param {Object} params - Los parámetros para la encriptación.
   * @param {string} params.publicKey - La clave pública para la encriptación.
   * @param {Buffer|string} params.data - Los datos a encriptar.
   * @returns {string} Los datos encriptados en formato base64.
   */
  static publicKeyEncrypt = ({ publicKey, data }) => {
    try {
      const formatedPublicKey = publicKey.replace(/\n+$/, "");
      const encryptedData = crypto.publicEncrypt(
        formatedPublicKey,
        Buffer.from(data)
      );
      return encryptedData.toString("base64");
    } catch (error) {
      return { error: `Ocurrio un error: ${error}` };
    }
  };

  /**
   * Desencripta los datos con la clave privada proporcionada.
   *
   * @static
   * @param {Object} params - Los parámetros para la desencriptación.
   * @param {string} params.privateKey - La clave privada para la desencriptación.
   * @param {Buffer|string} params.data - Los datos a desencriptar, en formato base64.
   * @returns {string} Los datos desencriptados.
   */
  static privateKeyDecrypt = ({ privateKey, data }) => {
    try {
      const formatedPrivateKey = privateKey.replace(/\n+$/, "");
      const buffer = Buffer.from(data, "base64");

      const decryptedData = crypto.privateDecrypt(formatedPrivateKey, buffer);

      return decryptedData.toString();
    } catch (error) {
      console.error(`Ocurrio un error ${error}`);
      return { error: `Ocurrio un error ${error}` };
    }
  };

  static publicFileEncrypt = async ({ publicKey, filePath, routeFinal }) => {
    const formatedKey = publicKey.replace(/\n+$/, "");
    const readStream = fsNormal.createReadStream(filePath, {
      highWaterMark: 501,
    });
    const writeStream = fsNormal.createWriteStream(routeFinal);

    await pipelineAsync(
      readStream,
      new Transform({
        transform(chunk, encoding, callback) {
          let encryptedBlock;
          try {
            encryptedBlock = crypto.publicEncrypt(
              { key: formatedKey, padding: crypto.constants.RSA_PKCS1_PADDING },
              chunk
            );
          } catch (error) {
            callback(new Error(`Ocurrio un error: ${error}`));
            return;
          }
          callback(null, encryptedBlock);
        },
      }),
      writeStream
    );
  };

  static privateFileDecrypt = async ({ privateKey, filePath, routeFinal }) => {
    const formatedKey = privateKey.replace(/\n+$/, "");
    const readStream = fsNormal.createReadStream(filePath, {
      highWaterMark: 512,
    });
    const writeStream = fsNormal.createWriteStream(routeFinal);

    await pipelineAsync(
      readStream,
      new Transform({
        transform(chunk, encoding, callback) {
          let decryptedBlock;
          try {
            decryptedBlock = crypto.privateDecrypt(
              {
                key: formatedKey,
                padding: crypto.constants.RSA_PKCS1_PADDING,
              },
              chunk
            );
          } catch (error) {
            callback(new Error(`Ocurrio un error: ${error}`));
            return;
          }
          callback(null, decryptedBlock);
        },
      }),
      writeStream
    );
  };
}

export default CryptManager;
