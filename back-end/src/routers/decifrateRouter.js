import upload from "../middlewares/chargeFiles.js";
import { Router } from "express";
import CryptManager from "../components/CryptManager.js";
import path from "node:path";
import XLSX from "xlsx";

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



decifrateRouter.post("/file", upload.array("files"), async (req, res) => {
  const { privateKey } = req.body;
  if (!privateKey) return res.json({ error: "No se envio la llave privada" });

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

      const workbook = XLSX.readFile(destino);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      const precioIndex = rows[0].findIndex((col) => col === "precio");

      const precioColumn = rows
        .slice(1)
        .map((row) => row[precioIndex]);

      const minValue = precioColumn.find((value) => !isNaN(value));

      allPrices.push({ name: originalName, minValue });
    });

    await Promise.all(decryptPromises);

    const minFile = allPrices.reduce(
      (min, file) => (file.minValue < min.minValue ? file : min),
      allPrices[0]
    );

    console.log(allPrices)
    return res.send(minFile);
  } catch (error) {
    console.error(error);
    return res.json({error: `Hubo un error ${error}`});
  }
});

export default decifrateRouter;
