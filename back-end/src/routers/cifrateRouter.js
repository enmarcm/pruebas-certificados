import { Router } from "express";
import CryptManager from "../components/CryptManager.js";
import CryptController from "../../controllers/CryptController.js";

const cifrateRouter = new Router();

cifrateRouter.post("/", CryptController.cifrateText);

cifrateRouter.post("/file", CryptController.cifrateFile);

export default cifrateRouter;
