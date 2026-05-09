const express = require("express");
const router = express.Router();
const axios = require("axios");

const db = require("../db");

router.get("/search/:keyword", async (req, res) => {
  const posts = await db.searchPosts(req.params.keyword);

  if (posts) {
    res.json({ status: 200, posts: posts });
  } else {
    res.json({ status: 404 });
  }
});

module.exports = router;
