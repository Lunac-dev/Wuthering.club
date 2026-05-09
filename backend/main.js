const dotenv = require("dotenv");

dotenv.config();
const express = require("express");
const app = express();
app.set("trust proxy", 1);
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ limit: "25mb", extended: true }));
const formData = require("express-form-data");
const os = require("os");
app.use(formData.parse({ uploadDir: os.tmpdir(), autoClean: true }));

const whitelist = [
  "https://wuthering.club",
  "https://www.wuthering.club",
];

app.set("trust proxy", 1);

const cors = require("cors");
const corsOptions = {
  origin: whitelist,
  //origin: "*",
  optionsSuccessStatus: 200,
  credentials: true,
  methods: ["GET", "POST", "DELETE"],
};

app.use(cors(corsOptions));

const user = require("./routes/user");
const post = require("./routes/post");
const img = require("./routes/img");
const comment = require("./routes/comment");
const follow = require("./routes/follow");
const timeline = require("./routes/timeline");
const search = require("./routes/search");
const likes = require("./routes/likes");
app.use(user, post, img, comment, follow, timeline, search, likes);

app.use((_req, res, _next) => {
  res.status(404).json({ status: 404 });
});

const server = app.listen(5000, function () {
  console.log("Node.js is listening to port", server.address().port);
});
