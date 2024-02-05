import CryptManager from "../src/components/CryptManager.js";
import path from "node:path";
import fs from "node:fs/promises";

class CryptController {
  static cifrateText = (req, res) => {
    try {
      const { publicKey, data } = req?.body;
      if (!publicKey | !data)
        return res.json({ error: "Faltan datos o son invalidos" });

      const result = CryptManager.publicKeyEncrypt({ publicKey, data });
      return res.json({ data: result });
    } catch (error) {
      return res.json({ error: `Ocurrio un error ${error}` });
    }
  };

  static cifrateFile = async (req, res) => {
    const { publicKey } = req.body;
    const ubication = "../../../../../excel-locura.xlsx";
    const destino = "../../../../../cifradoNuevo.txt";

    const result = await CryptManager.publicFileEncrypt({
      publicKey,
      filePath: ubication,
      routeFinal: destino,
    });
    return res.send(result);
  };

  static decifrateText = (req, res) => {
    try {
      const { privateKey, data } = req?.body;
      if (!privateKey | !data)
        return res.json({ error: "Faltan datos o son invalidos" });

      const result = CryptManager.privateKeyDecrypt({ privateKey, data });
      return res.json({ data: result });
    } catch (error) {
      return res.json({ error: `Ocurrio un error ${error}` });
    }
  };

  static decifrateFile = async (req, res) => {
    const privateKey =
      req.body?.privateKey === "null" || !req.body?.privateKey
        ? await CryptController.getPrivateKey()
        : req.body?.privateKey;

    const { extensionFile = "txt" } = req.body;

    try {
      const decryptPromises = req.files.map(async (file) => {
        const ubication = file.path;
        const originalName = path.basename(ubication, path.extname(ubication));
        const destino = path.join(
          path.dirname(ubication),
          originalName + `Descifrado.${extensionFile}`
        );

        await CryptManager.privateFileDecrypt({
          filePath: ubication,
          routeFinal: destino,
          privateKey,
        });
      });

      await Promise.all(decryptPromises);

      return res.json({ message: `Se decifro correctamente` });
    } catch (error) {
      console.error(error);
      return res.json({ error: `Hubo un error ${error}` });
    }
  };
  static generatePairKeys = (req, res) => {
    const key = CryptManager.generatePairKeys({});
    return res.send(key);
  };
}

export default CryptController;
