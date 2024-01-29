/**
 * @file Archivo principal de la aplicación.
 * @description Este es un servidor desarrollado en node.js con Express, contiene un conjunto de librerias propias y una arquitectura ya definida
 * @author Enmanuel Colina <theenmanuel123@gmail.com>
 */

import express from "express";
import picocolors from "picocolors";
import iSession from "./data/session-data/iSession.js";
import {
  midCors,
  midJson,
  midNotFound,
  cors,
  httpToS,
} from "./middlewares/middlewares.js";
import mainRouter from "./routers/mainRouter.js";
import CryptManager from "./components/CryptManager.js";
import iHttps from "./data/https-data/iHttps.js";

/**
 * Puerto en el que se iniciará el servidor.
 * @type {number}
 */
const PORT = process.env.PORT ?? 7878;

/**
 * Instancia de la aplicación Express.
 * @type {express.Application}
 */
const app = express();

// Configuración de middlewares y routers.

// app.enable('trust proxy'); // <-- Se agrego para redireccionar a HTTPS
// app.use(httpToS); // <-- Se agrego para redireccionar a HTTPS
app.use(express.json());
app.use(midCors);
app.use(cors({ credentials: true, origin: true })); // <-- Se agrego para Navegador WEB
app.use(iSession.loadSession);
app.use(midJson); // <-- Se agrego para manejar excepciones de JSON en formato incorrecto

//*
//? Desde aqui colocamos los routers
app.use("/", mainRouter);

app.get("/generateKey", (req, res) => {
  const key = CryptManager.generateKey({ typeKey: "aes", lengthKey: 128 });
  return res.json(key);
});

app.get("/generatePairKeys", (req, res) => {
  const key = CryptManager.generatePairKeys({});
  return res.send(key);
});

app.post("/cifrate", (req, res) => {
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

app.post("/decifrate", (req, res) => {
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

app.post("/cifrateFile", async (req, res) => {
  const { publicKey } = req.body;
  const ubication = "../../../../../excel-locura.xlsx";
  const destino = "../../../../../cifradoNuevo.txt";

  const result = await CryptManager.publicFileEncrypt({
    publicKey,
    filePath: ubication,
    routeFinal: destino,
  });
});

app.post("/decifrateFile", async (req, res) => {
  const { privateKey } = req.body;

  const ubication = "../../../../../cifradoNuevo.txt";
  const destino = "../../../../../helloholas.xlsx";

  const result = await CryptManager.privateFileDecrypt({
    filePath: ubication,
    routeFinal: destino,
    privateKey,
  });
  return result;
});
//*

app.use(midNotFound);

/**
 * Función que se ejecuta cuando el servidor está escuchando en el puerto especificado.
 * @function
 * @returns {void}
 */
const listenServer = () =>
  console.log(
    picocolors.bgWhite(
      picocolors.black(`El servidor esta iniciado en el PUERTO ${PORT}...`)
    )
  );

//* Inicio del servidor
// iHttps.listenServer({ app, listen: listenServer, PORT });
app.listen(PORT, listenServer);
