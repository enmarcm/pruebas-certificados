const midJson = (err, req, res, next) => {
    if (err instanceof SyntaxError) {
      return res.status(400).json({ error: "El cuerpo de la solicitud no es un JSON válido" });
    }
    next();
};

export default midJson;
