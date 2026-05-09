const express = require("express");
const router = express.Router();
const axios = require("axios");

const db = require("../db");

const rate = require("express-rate-limit");

const Minio = require("minio");

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || "YOUR_S3_ENDPOINT",
  useSSL: true,
  accessKey: process.env.MINIO_ACCESSKEY,
  secretKey: process.env.MINIO_SECRETKEY,
});

const limiter = rate({
  windowMs: 5 * 60 * 1000, // 5分間のウィンドウ
  max: 3, // 5分間に3回まで投稿可能
  standardHeaders: true,
  legacyHeaders: false,
  handler: function (_req, res, _next) {
    return res.status(429).json({
      status: 429,
      error: "Too many requests. Please wait before posting again.",
    });
  },
  keyGenerator: (req, _res) => req.ip || req.headers["x-forwarded-for"],
});

// 投稿する
router.post("/post", limiter, async (req, res) => {
  // Auth
  if (req.header("Authorization") == undefined) {
    res.end(JSON.stringify({ status: 400 }));
    return;
  }
  let auth = undefined;
  try {
    auth = await axios.get("https://discordapp.com/api/users/@me", {
      headers: {
        Authorization: req.header("Authorization"),
      },
    });
  } catch (err) {
    console.error(err.message, req.headers["cf-connecting-ip"]);
    return;
  }
  // End
  const user = await db.getUser(auth.data.id);

  if (user === undefined) {
    res.json({ status: 400 });
    return;
  } else if (user.locked != 0) {
    res.json({ status: 400 });
    return;
  }

  const insert = await db.addPost(
    req.body.title,
    user.id,
    req.body.content,
    req.body.thumbnail,
    req.body.square
  );

  if (insert) {
    res.json({ status: 200, id: insert });
  } else {
    res.json({ status: 400 });
  }
});

// 投稿を編集する
router.post("/edit", async (req, res) => {
  // Auth
  if (req.header("Authorization") == undefined) {
    res.end(JSON.stringify({ status: 400 }));
    return;
  }
  let auth = undefined;
  try {
    auth = await axios.get("https://discordapp.com/api/users/@me", {
      headers: {
        Authorization: req.header("Authorization"),
      },
    });
  } catch (err) {
    console.error(err.message, req.headers["cf-connecting-ip"]);
    return;
  }
  // End
  const user = await db.getUser(auth.data.id);

  if (user === undefined) {
    res.json({ status: 400 });
    return;
  } else if (user.locked != 0) {
    res.json({ status: 400 });
    return;
  }

  const post = await db.getPost(req.body.id);
  if (post.author !== user.id) {
    res.json({ status: 400 });
    return;
  }

  const edit = await db.editPost(
    req.body.title,
    req.body.content,
    req.body.thumbnail,
    post.id
  );

  if (edit) {
    res.json({ status: 200 });
  } else {
    res.json({ status: 400 });
  }
});

router.get("/delete/:id", async (req, res) => {
  // Auth
  if (req.header("Authorization") == undefined) {
    res.end(JSON.stringify({ status: 400 }));
    return;
  }
  let auth = undefined;
  try {
    auth = await axios.get("https://discordapp.com/api/users/@me", {
      headers: {
        Authorization: req.header("Authorization"),
      },
    });
  } catch (err) {
    console.error(err.message, req.headers["cf-connecting-ip"]);
    return;
  }
  // End
  const user = await db.getUser(auth.data.id);

  if (user === undefined) {
    res.json({ status: 400 });
    return;
  } else if (user.locked != 0) {
    res.json({ status: 400 });
    return;
  }

  const post = await db.getPost(req.params.id);
  if (post.author !== user.id) {
    res.json({ status: 400 });
    return;
  }

  const del = await db.deletePost(post.id);
  const imgID = post.thumbnail.replace(
    `https://${process.env.MINIO_ENDPOINT || "YOUR_S3_ENDPOINT"}/wuthering/`,
    ""
  );
  if (del) {
    await minioClient.removeObject("wuthering", imgID);
    res.json({ status: 200 });
  } else {
    res.json({ status: 400 });
  }
});

router.get("/posts", async (req, res) => {
  const posts = await db.getLatestPosts();

  if (posts) {
    res.json({ status: 200, posts: posts });
  } else {
    res.json({ status: 400 });
  }
});

router.get("/posts/:id", async (req, res) => {
  const square_id = req.params.id;

  if (!square_id) {
    res.json({ status: 400 });
    return;
  }

  const posts = await db.getSquarePosts(square_id);

  if (posts) {
    res.json({ status: 200, posts: posts });
  } else {
    res.json({ status: 400 });
  }
});

router.get("/post/:id", async (req, res) => {
  const post = await db.getPost(req.params.id);

  if (post) {
    res.json({
      status: 200,
      post: {
        id: post.id,
        title: post.title,
        thumbnail: post.thumbnail,
        square: post.name,
        views: post.views,
        posted_date: post.posted_date,
        avatar: post.avatar,
        username: post.username,
        discord_id: post.discord_id,
        content: post.content,
        author: post.author,
      },
    });
  } else {
    res.json({ status: 400 });
  }
});

module.exports = router;
