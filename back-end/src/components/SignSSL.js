import forge from "node-forge";

class SignSSL {
  /**
   * Firma un certificado.
   *
   * @static
   * @async
   * @param {Object} params - Los parámetros.
   * @param {string} params.csrPem - El CSR en formato PEM.
   * @param {string} params.privateKeyPem - La clave privada en formato PEM.
   * @param {number} [params.days=365] - El número de días para los que el certificado es válido.
   * @param {string} params.companyName - El nombre de la empresa.
   * @param {string} [params.countryName='Venezuela'] - El nombre del país.
   * @param {string} [params.stateName='Zulia'] - El nombre del estado.
   * @param {string} [params.localityName='Maracaibo'] - El nombre de la localidad.
   * @param {string} [params.organitationName='Certificadoras Seguridad'] - El nombre de la organización.
   * @param {string} [params.email='theenmanuel123@gmail.com'] - La dirección de correo electrónico.
   * @returns {Promise<string>} El certificado firmado en formato PEM.
   * @throws {Error} Si hubo un error durante el proceso de firma.
   */
  static signCertificate = async ({
    csrPem,
    privateKeyPem,
    companyName = "Industrias Stark",
    countryName = "Venezuela",
    stateName = "Zulia",
    localityName = "Maracaibo",
    organitationName = "Certificadoras Seguridad",
    days = 365,
    email = "theenmanuel123@gmail.com",
  }) => {
    try {
      if (
        !csrPem.includes("-----BEGIN CERTIFICATE REQUEST-----") ||
        !csrPem.includes("-----END CERTIFICATE REQUEST-----") ||
        !privateKeyPem.includes("-----BEGIN PRIVATE KEY-----") ||
        !privateKeyPem.includes("-----END PRIVATE KEY-----")
      ) {
        return { error: "Formato de csrPem o privateKeyPem incorrecto" };
      }

      const formatedCsrPem = csrPem.replace(/\n+$/, "");
      const formatedKeyPem = privateKeyPem.replace(/\n+$/, "");

      const csr = forge.pki.certificationRequestFromPem(formatedCsrPem);
      const privateKey = forge.pki.privateKeyFromPem(formatedKeyPem);

      const cert = forge.pki.createCertificate();
      cert.publicKey = csr.publicKey;
      cert.serialNumber = "01";
      cert.validity.notBefore = new Date();
      cert.validity.notAfter = new Date();
      cert.validity.notAfter.setDate(cert.validity.notBefore.getDate() + days);

      // Agregar más atributos al sujeto (la compañía)
      const subjectAttrs = [
        { name: "commonName", value: companyName },
        { name: "countryName", value: countryName },
        { name: "stateOrProvinceName", value: stateName },
        { name: "localityName", value: localityName },
        { name: "organizationName", value: companyName },
        { name: "emailAddress", value: email },
      ];

      // Agregar más atributos al emisor (la organización certificadora)
      const issuerAttrs = [
        { name: "commonName", value: organitationName },
        { name: "countryName", value: countryName },
        { name: "stateOrProvinceName", value: stateName },
        { name: "localityName", value: localityName },
        { name: "organizationName", value: organitationName },
        { name: "emailAddress", value: email },
      ];

      cert.setSubject(subjectAttrs);
      cert.setIssuer(issuerAttrs);
      cert.setExtensions([
        {
          name: "basicConstraints",
          cA: true,
        },
        {
          name: "keyUsage",
          keyCertSign: true,
          digitalSignature: true,
          nonRepudiation: true,
          keyEncipherment: true,
          dataEncipherment: true,
        },
      ]);
      cert.sign(privateKey);

      const pem = forge.pki.certificateToPem(cert);
      return pem;
    } catch (error) {
      console.error(`Ocurrio un error ${error}`);
    }
  };

  /**
   * Genera un CSR (Certificate Signing Request) basado en los detalles del certificado proporcionados.
   *
   * @param {Object} params - Los detalles del certificado.
   * @param {string} params.commonName - El nombre común del certificado. Por defecto es 'www.mydomain.com'.
   * @param {string} params.country - El país del certificado. Por defecto es 'US'.
   * @param {string} params.state - El estado del certificado. Por defecto es 'California'.
   * @param {string} params.locality - La localidad del certificado. Por defecto es 'San Francisco'.
   * @param {string} params.organization - La organización del certificado. Por defecto es 'My Company'.
   * @param {string} params.organizationUnit - La unidad organizativa del certificado. Por defecto es 'IT Department'.
   * @param {string} params.privateKey - La clave privada para firmar el CSR. Debe estar en formato PEM.
   * @returns {Promise<string>} El CSR en formato PEM.
   * @throws {Error} Si la clave privada no está en el formato correcto.
   */
  static generateCSR = async ({
    commonName = "www.mydomain.com",
    country = "US",
    state = "California",
    locality = "San Francisco",
    organization = "My Company",
    organizationUnit = "IT Department",
    privateKey,
  }) => {
    //Verificar si envio la private Key
    if (!privateKey) return { error: "No envio la privateKey" };

    //Verificar si esta en el formato correcto
    if (
      !privateKey.includes("-----BEGIN PRIVATE KEY-----") ||
      !privateKey.includes("-----END PRIVATE KEY-----")
    ) {
      return { error: "Formato de privateKey incorrecto" };
    }

    //Formatear
    const formattedPrivateKey = privateKey
      .replace(/\\n/g, "\n")
      .replace(/\\r/g, "\r");

    const privateKeyObject = forge.pki.privateKeyFromPem(formattedPrivateKey);

    const csr = forge.pki.createCertificationRequest();
    csr.publicKey = privateKeyObject;
    csr.setSubject([
      {
        name: "commonName",
        value: commonName,
      },
      {
        name: "countryName",
        value: country,
      },
      {
        name: "stateOrProvinceName",
        value: state,
      },
      {
        name: "localityName",
        value: locality,
      },
      {
        name: "organizationName",
        value: organization,
      },
      {
        name: "organizationalUnitName",
        value: organizationUnit,
      },
    ]);

    // sign certification request
    csr.sign(privateKeyObject);

    // convert certification request to PEM format
    const pem = forge.pki.certificationRequestToPem(csr);

    return pem;
  };
}

export default SignSSL;
