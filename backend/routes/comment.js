const express = require("express");
const router = express.Router();
const axios = require("axios");
const db = require("../db.js");

router.get("/comments/:id", async (req, res) => {
  const comments = await db.getComments(req.params.id);

  res.json(comments);
});

router.post("/addComment", async (req, res) => {
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

  await db.addComment(
    req.body.post_id,
    user.id,
    req.body.content,
    req.body.parent_id
  );

  res.json({ status: 200 });
});

router.post("/deleteComment", async (req, res) => {
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

  // ユーザーが存在しているか
  if (user === undefined) {
    res.json({ status: 400 });
    return;
  }

  //　コメント主が自分か
  const comment = await db.getComment(req.body.id);
  if (comment === undefined || comment.user_id !== user.id) {
    res.json({ status: 400 });
    return;
  }

  await db.deleteComment(comment.id);

  res.json({ status: 200 });
});

module.exports = router;
