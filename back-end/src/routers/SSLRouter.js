import { Router } from "express";
import SSLController from "../../controllers/SSLController.js";

const SSLRouter = Router();

SSLRouter.post("/obtainCSR", SSLController.obtainCSR);

SSLRouter.post("/obtainCertificate", SSLController.obtainCertificate);

export default SSLRouter;
