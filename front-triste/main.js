const form = document.querySelector("#evento");
const containerCertificado = document.querySelector(".contenedorCertificado");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const fields = new window.FormData(e.target);

  const privateKey = fields.get("privateKey");
  const CSR = fields.get("CSR");
  const company = fields.get("company");
  const certificadora = fields.get("certificadora");
  const email = fields.get("email");

  const response = await fetch("http://localhost:7878", {
    method: "POST",
    body: JSON.stringify({
      privateKey,
      csr: CSR,
      companyName: company,
      organitationName: certificadora,
      email,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) return console.warn("no llego siquiera xd");

  const data = await response.json();

  if (data === null || data === undefined || data.error) return;

  const { certificado } = data;

  containerCertificado.innerText = certificado;
});
