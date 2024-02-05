import SignSSL from "../src/components/SignSSL.js";

class SSLController {
  static obtainCSR = async (req, res) => {
    const {
      commonName,
      country,
      state,
      locality,
      organization,
      organizationUnit,
      privateKey,
    } = req.body;
  
    if (!privateKey) return res.json({ error: "No se envio la llave privada" });
  
    const CSR = await SignSSL.generateCSR({
      commonName,
      country,
      state,
      locality,
      organization,
      organizationUnit,
      privateKey,
    });
  
    if (CSR.error) return res.json({ error: CSR.error });
  
    return res.json({ success: CSR });
  }

  static obtainCertificate = async (req, res) => {
    const {
      csrPem,
      privateKeyPem,
      companyName,
      countryName,
      stateName,
      localityName,
      organitationName,
      days,
      email,
    } = req.body;
  
    if (!csrPem || !privateKeyPem)
      return res.json({
        error: "No se incluyo la llave privada o la solicitud CSR",
      });
  
    const certificate = await SignSSL.signCertificate({
      csrPem,
      companyName,
      privateKeyPem,
      countryName,
      days,
      email,
      localityName,
      organitationName,
      stateName,
    });
  
    if (certificate?.error)
      return res.json({ error: `Ocurrio un error ${certificate.error}` });
  
    return res.json({ success: certificate });
  }
}

export default SSLController