import upload from "../middlewares/chargeFiles.js";
import { Router } from "express";
import CryptController from "../../controllers/CryptController.js";
import ExcelController from "../../controllers/ExcelController.js";

const decifrateRouter = Router();

decifrateRouter.post("/", CryptController.decifrateText);

decifrateRouter.post(
  "/fileExcel",
  upload.array("files"),
  ExcelController.compareWinner
);

decifrateRouter.post(
  "/file",
  upload.array("files"),
  CryptController.decifrateFile
);

export default decifrateRouter;
