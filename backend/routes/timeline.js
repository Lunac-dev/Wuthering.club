const express = require("express");
const router = express.Router();
const axios = require("axios");

const db = require("../db");

router.get("/timeline", async (req, res) => {
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

  const posts = await db.followingPosts(user.id);

  if (posts) {
    res.json({ status: 200, posts: posts });
  } else {
    res.json({ status: 400 });
  }
});

module.exports = router;
