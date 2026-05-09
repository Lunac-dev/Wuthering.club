const express = require("express");
const router = express.Router();

const Minio = require("minio");
const db = require("../db");
const axios = require("axios").default;

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || "YOUR_S3_ENDPOINT",
  useSSL: true,
  accessKey: process.env.MINIO_ACCESSKEY,
  secretKey: process.env.MINIO_SECRETKEY,
});

router.post("/v2/uploadImg", async function (req, res) {
  // 単一ファイルを取得
  const file = req.files.file;
  // ランダムなファイル名を生成
  const randomID = Math.random().toString(32).substring(2);
  const randomFilename = randomID + "_" + file.originalFilename;
  if (!file) {
    res.json({ status: 404, error: "File is not found." });
    return;
  }
  // minio 経由でアップロード
  minioClient.fPutObject(
    "wuthering",
    randomFilename,
    file.path,
    function (err, objInfo) {
      if (err) {
        res.json({ status: 400, error: "Error occurred during upload" });
        console.error(err);
        return;
      }
    }
  );
  res.json({ status: 200, id: randomFilename });
});

router.post("/v2/remove", async function (req, res) {
  const id = req.body.id;
  if (!id) return res.json({ status: 404 });
  try {
    await minioClient.removeObject("wuthering", id);
    res.json({ status: 200 });
  } catch (err) {
    res.json({ status: 400, error: "Unable to remove file" });
    console.error("Unable to remove file", err);
  }
});

module.exports = router;
