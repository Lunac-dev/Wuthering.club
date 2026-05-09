const express = require("express");
const router = express.Router();
const axios = require("axios");
const db = require("../db.js");

const { Webhook } = require("discord-webhook-node");
const hook = new Webhook(process.env.DISCORD_WEBHOOK_URL);

router.post("/checkuser", async function (req, res) {
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
    // create user
    await db.addUser(auth.data);
    hook.send(
      "ユーザー情報を登録: " + auth.data.username + " (" + auth.data.id + ")"
    );
  } else {
    await db.updateUser(auth.data);
    hook.send(
      "ユーザー情報を更新: " +
        auth.data.username +
        " (" +
        auth.data.id +
        ")" +
        " 認証済み: " +
        auth.data.verified
    );
  }

  // check discord verified
  if (!auth.data.verified) {
    await db.lockUser(auth.data.id, 2);
  }

  res.json({ status: 201 });
});

router.get("/user/:id", async function (req, res) {
  const user = await db.getUserByID(req.params.id);

  if (!user) {
    res.json({ status: 400 });
    return;
  }

  const followers = await db.followers(user.id);
  const following = await db.following(user.id);

  const posts = await db.getUserPosts(user.id);

  res.json({
    id: user.id,
    username: user.username,
    avatar: user.avatar,
    created_date: user.created_date,
    profile: user.profile,
    followers: followers.length,
    following: following.length,
    posts: posts,
  });
});

module.exports = router;
