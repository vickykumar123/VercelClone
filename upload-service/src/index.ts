import express from "express";
import cors from "cors";
import simpleGit from "simple-git";
import {generateId} from "./generate-id";
import path from "path";
import {getAllFiles} from "./file";
import "dotenv/config";
import {uploadFile} from "./aws";
import publisher from "./redis/client";
import subscriber from "./redis/client";

const app = express();
app.use(express.json());
app.use(cors());
app.post("/deploy", async (req, res) => {
  const repoUrl = req.body.repoUrl;
  const id = generateId();
  await simpleGit().clone(repoUrl, path.join(__dirname, `repoClone/${id}`));
  const files = getAllFiles(path.join(__dirname, `repoClone/${id}`));
  files.forEach(async (file) => {
    const convertedFile = file.replace(/\\/g, "/");
    await uploadFile(convertedFile.slice(__dirname.length + 1), file);
  });
  await new Promise((resolve) => setTimeout(resolve, 5000));
  await publisher.lPush("build-queue", id);
  await publisher.hSet("status", id, "uploaded");

  res.status(200).json({
    message: "Repo cloned sucessfully",
    repoId: id,
  });
});

app.get("/status", async (req, res) => {
  const id = req.query.id;
  const response = await subscriber.hGet("status", id as string);
  res.json({
    status: response,
  });
});

app.listen(3000, () => {
  console.log("Server as started");
});
