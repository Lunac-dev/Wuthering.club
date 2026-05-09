const express = require("express");
const router = express.Router();
const axios = require("axios");
const db = require("../db.js");

// フォローする
router.post("/follow", async (req, res) => {
  const { followed_id } = req.body;

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

  const follower_id = user.id;

  if (follower_id === followed_id) {
    return res.status(400).json({ message: "自分自身をフォローできません" });
  }

  try {
    await db.follow(follower_id, followed_id);
    res.json({ status: 200 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 500 });
  }
});

// フォロー解除
router.post("/unfollow", async (req, res) => {
  const { followed_id } = req.body;

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

  const follower_id = user.id;

  try {
    await db.unfollow(follower_id, followed_id);
    res.json({ status: 200 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 500 });
  }
});

// フォローしているユーザー一覧
router.get("/following/:id/:discord_id", async (req, res) => {
  let user_id = req.params.id;
  const { discord_id } = req.params;

  if (discord_id === "true") {
    const user = await db.getUser(user_id);
    user_id = user.id;
  }

  if (user_id === undefined) {
    res.json({ status: 400 });
    return;
  }

  try {
    const following = await db.following(user_id);
    res.json(following);
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 500 });
  }
});

// フォロワー一覧
router.get("/followers/:user_id", async (req, res) => {
  const user_id = req.params.user_id;

  try {
    const followers = await db.followers(user_id);
    res.json(followers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 500 });
  }
});

module.exports = router;
