import { Router } from "express";
import CryptManager from "../components/CryptManager.js";

const keysRouter = Router();

keysRouter.get("/", (req, res) => {
  const key = CryptManager.generatePairKeys({});
  return res.send(key);
});

export default keysRouter;
