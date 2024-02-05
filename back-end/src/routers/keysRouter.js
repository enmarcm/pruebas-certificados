import { Router } from "express";
import CryptController from "../../controllers/CryptController.js";

const keysRouter = Router();

keysRouter.get("/", CryptController.generatePairKeys);

export default keysRouter;
