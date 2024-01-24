import { Router } from "express";
import SignSSL from "../components/SignSSL.js";

const mainRouter = Router();

mainRouter.get("/", (req, res) => {
  return res.json({ message: "Hola mundo" });
});

mainRouter.post("/", async (req, res) => {
  const {
    privateKey,
    csr,
    companyName,
    days,
    countryName,
    stateName,
    localityName,
    organitationName,
    email,
  } = req.body;
  if (!privateKey || !csr || !companyName)
    return res.json({ error: "Faltan datos" });

  const response = await SignSSL.signCertificate({
    csrPem: csr,
    privateKeyPem: privateKey,
    companyName,
    days,
    organitationName,
    email
  });

  if (response.error || response === null)
    return res.json({ error: "Error al firmar el certificado" });

  console.log(response);

  return res.json({ certificado: response });
});

export default mainRouter;
