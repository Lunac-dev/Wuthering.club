const express = require("express");
const router = express.Router();
const axios = require("axios");
const db = require("../db");

// いいねを追加
router.post("/likes", async (req, res) => {
  const { post_id } = req.body;
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
  if (!user) {
    res.json({ status: 400 });
    return;
  } else if (user.locked != 0) {
    res.json({ status: 400 });
    return;
  }
  const user_id = user.id;
  // いいねを追加
  const like = await db.addLike(user_id, post_id);
  if (like) {
    res.json({ success: true });
  } else {
    res.status(500).json({ error: "すでにいいねしています" });
  }
});

// いいねを解除
router.delete("/likes", async (req, res) => {
  const { post_id } = req.body;
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
  if (!user) {
    res.json({ status: 400 });
    return;
  } else if (user.locked != 0) {
    res.json({ status: 400 });
    return;
  }
  const user_id = user.id;
  // いいねを解除
  const like = await db.removeLike(user_id, post_id);
  if (like) {
    res.json({ success: true });
  } else {
    res.status(500).json({ error: "削除に失敗しました" });
  }
});

// いいね数を取得
router.get("/likes/:post_id", async (req, res) => {
  const { post_id } = req.params;
  const like = await db.getLike(post_id);
  if (like !== undefined) {
    res.json({ count: like });
  } else {
    res.status(500).json({ error: "取得に失敗しました" });
  }
});

// ユーザーがいいねしているか確認
router.get("/likesUser/:post_id", async (req, res) => {
  const { post_id } = req.params;
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
  if (!user) {
    res.json({ status: 400 });
    return;
  } else if (user.locked != 0) {
    res.json({ status: 400 });
    return;
  }
  const user_id = user.id;
  // ユーザーがいいねしているか確認
  const like = await db.getLikeByUser(post_id, user_id);
  if (like !== undefined) {
    res.json({ liked: like > 0 });
  } else {
    res.status(500).json({ error: "取得に失敗しました" });
  }
});

module.exports = router;
