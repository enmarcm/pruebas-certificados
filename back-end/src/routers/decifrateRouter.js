import upload from "../middlewares/chargeFiles.js";
import { Router } from "express";
import CryptManager from "../components/CryptManager.js";
import path, { format } from "node:path";
import ExcelComponent from "../components/ExcelComponent.js";
import fs from "node:fs/promises";

const decifrateRouter = Router();

decifrateRouter.post("/", (req, res) => {
  try {
    const { privateKey, data } = req?.body;
    if (!privateKey | !data)
      return res.json({ error: "Faltan datos o son invalidos" });

    const result = CryptManager.privateKeyDecrypt({ privateKey, data });
    return res.json({ data: result });
  } catch (error) {
    return res.json({ error: `Ocurrio un error ${error}` });
  }
});

const obtenerPrivateKey = async () => {
  const currentDirectory = process.cwd();
  const ubication = path.join(currentDirectory, "src/data/privateKey.txt");
  const newPrivateKey = await fs.readFile(ubication, "utf-8");

  if (newPrivateKey.length === 0)
    throw new Error("No se encontro la llave privada");

  return newPrivateKey;
};

decifrateRouter.post("/fileExcel", upload.array("files"), async (req, res) => {
  const privateKey =
    req.body?.privateKey === "null" || !req.body?.privateKey
      ? await obtenerPrivateKey()
      : req.body?.privateKey;

  const allPrices = [];

  try {
    const decryptPromises = req.files.map(async (file) => {
      const ubication = file.path;
      const originalName = path.basename(ubication, path.extname(ubication));
      const destino = path.join(
        path.dirname(ubication),
        originalName + "Descifrado.xlsx"
      );

      await CryptManager.privateFileDecrypt({
        filePath: ubication,
        routeFinal: destino,
        privateKey,
      });

      const sheets = ExcelComponent.readSheet({
        filePath: destino,
        indexSheet: 0,
      });

      const rows = ExcelComponent.convertToJson({ worksheet: sheets });

      const minValue = ExcelComponent.returnFirnResult({
        rows,
        columnName: "precio",
        isNumber: true,
      });

      allPrices.push({ name: originalName, minValue });
    });

    await Promise.all(decryptPromises);

    const minFile = allPrices.reduce(
      (min, file) => (file.minValue < min.minValue ? file : min),
      allPrices[0]
    );

    console.log(allPrices);
    return res.send(minFile);
  } catch (error) {
    console.error(error);
    return res.json({ error: `Hubo un error ${error}` });
  }
});

decifrateRouter.post("/file", upload.array("files"), async (req, res) => {
  
  const privateKey =
    req.body?.privateKey === "null" || !req.body?.privateKey
      ? await obtenerPrivateKey()
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
});

export default decifrateRouter;
