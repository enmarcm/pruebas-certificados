import CryptManager from "../src/components/CryptManager.js";
import ExcelComponent from "../src/components/ExcelComponent.js";
import { getPrivateKey } from "../src/utils/getPrivateKey.js";
import path from "node:path"

class ExcelController {
  static compareWinner = async (req, res) => {
    const privateKey =
      req.body?.privateKey === "null" || !req.body?.privateKey
        ? await getPrivateKey()
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

      const minFiles = allPrices.reduce(
        (minFiles, file) => {
          if (file.minValue < minFiles[0].minValue) {
            return [file];
          } else if (file.minValue === minFiles[0].minValue) {
            return [...minFiles, file];
          } else {
            return minFiles;
          }
        },
        [allPrices[0]]
      );

      return res.send(minFiles);
    } catch (error) {
      console.error(error);
      return res.json({ error: `Hubo un error ${error}` });
    }
  };
}

export default ExcelController;
