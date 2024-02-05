import path from "node:path";
import fs from "node:fs/promises";

export const getPrivateKey = async () => {
  const currentDirectory = process.cwd();
  const ubication = path.join(currentDirectory, "src/data/privateKey.txt");
  const newPrivateKey = await fs.readFile(ubication, "utf-8");

  if (newPrivateKey.length === 0)
    throw new Error("No se encontro la llave privada");

  return newPrivateKey;
};
