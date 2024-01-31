import { Router } from "express";
import CryptManager from "../components/CryptManager.js";

const cifrateRouter = new Router();

cifrateRouter.post("/", (req, res) => {
  try {
    const { publicKey, data } = req?.body;
    if (!publicKey | !data)
      return res.json({ error: "Faltan datos o son invalidos" });

    const result = CryptManager.publicKeyEncrypt({ publicKey, data });
    return res.json({ data: result });
  } catch (error) {
    return res.json({ error: `Ocurrio un error ${error}` });
  }
});

cifrateRouter.post("/file", async (req, res) => {
  const { publicKey } = req.body;
  const ubication = "../../../../../excel-locura.xlsx";
  const destino = "../../../../../cifradoNuevo.txt";

  const result = await CryptManager.publicFileEncrypt({
    publicKey,
    filePath: ubication,
    routeFinal: destino,
  });
  return res.send(result);
});

export default cifrateRouter;
