import forge from "node-forge";

class SignSSL {
  /**
   * Sign a certificate.
   *
   * @static
   * @async
   * @param {Object} params - The parameters.
   * @param {string} params.csrPem - The CSR in PEM format.
   * @param {string} params.privateKeyPem - The private key in PEM format.
   * @param {number} [params.days=365] - The number of days for which the certificate is valid.
   * @param {string} params.companyName - The name of the company.
   * @param {string} [params.countryName='Venezuela'] - The name of the country.
   * @param {string} [params.stateName='Zulia'] - The name of the state.
   * @param {string} [params.localityName='Maracaibo'] - The name of the locality.
   * @param {string} [params.organitationName='Certificadoras Seguridad'] - The name of the organization.
   * @param {string} [params.email='theenmanuel123@gmail.com'] - The email address.
   * @returns {Promise<string>} The signed certificate in PEM format.
   * @throws {Error} If there was an error during the signing process.
   */
  static signCertificate = async ({
    csrPem,
    privateKeyPem,
    days = 365,
    companyName,
    countryName = "Venezuela",
    stateName = "Zulia",
    localityName = "Maracaibo",
    organitationName = "Certificadoras Seguridad",
    email = "theenmanuel123@gmail.com",
  }) => {
    try {
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
}

export default SignSSL;
