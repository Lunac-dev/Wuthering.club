const dayjs = require("dayjs");
dayjs.extend(require("dayjs/plugin/utc"));
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: "root",
  password: process.env.DB_USER_PASSWORD,
  database: process.env.DB_NAME,
});

console.info("[i] Database connected to " + process.env.DB_HOST);

module.exports = {
  async getUser(discord_id) {
    const conn = await pool.getConnection();
    const [rows] = await conn.execute(
      "SELECT * FROM users WHERE discord_id = ? LIMIT 1",
      [discord_id]
    );
    conn.release();
    return rows[0];
  },

  async getUserByID(user_id) {
    const conn = await pool.getConnection();
    const [rows] = await conn.execute(
      "SELECT * FROM users WHERE id = ? LIMIT 1",
      [user_id]
    );
    conn.release();
    return rows[0];
  },

  // Get latest posts
  async getLatestPosts() {
    try {
      const conn = await pool.getConnection();
      const [rows] = await conn.execute(
        "SELECT posts.id, posts.author, posts.title, posts.thumbnail, posts.short_content, posts.posted_date, users.username, users.avatar, users.discord_id, squares.name, COUNT(comments.id) AS comment_count FROM posts JOIN users ON posts.author = users.id JOIN squares ON squares.id = posts.square LEFT JOIN comments ON comments.post_id = posts.id GROUP BY posts.id ORDER BY posts.posted_date DESC;"
      );
      conn.release();
      return rows;
    } catch (err) {
      console.error(err);
      return false;
    }
  },

  // Get target square posts
  async getSquarePosts(id) {
    try {
      const conn = await pool.getConnection();
      const [rows] = await conn.execute(
        "SELECT posts.id, posts.author, posts.title, posts.thumbnail, posts.posted_date, posts.short_content, users.username, users.avatar, users.discord_id, squares.name, COUNT(comments.id) AS comment_count FROM posts JOIN users ON posts.author = users.id JOIN squares ON squares.id = posts.square LEFT JOIN comments ON comments.post_id = posts.id WHERE posts.square = ? GROUP BY posts.id ORDER BY posts.posted_date DESC;",
        [id]
      );
      conn.release();
      return rows;
    } catch (err) {
      console.error(err);
      return false;
    }
  },

  // Get target user posts
  async getUserPosts(id) {
    try {
      const conn = await pool.getConnection();
      const [rows] = await conn.execute(
        "SELECT posts.id, posts.author, posts.title, posts.thumbnail, posts.posted_date, posts.short_content, users.username, users.avatar, users.discord_id, squares.name, COUNT(comments.id) AS comment_count FROM posts JOIN users ON posts.author = users.id JOIN squares ON squares.id = posts.square LEFT JOIN comments ON posts.id = comments.post_id WHERE posts.author = ? GROUP BY posts.id ORDER BY posts.posted_date DESC;",
        [id]
      );
      conn.release();
      return rows;
    } catch (err) {
      console.error(err);
      return false;
    }
  },

  // Search posts
  async searchPosts(query) {
    try {
      const conn = await pool.getConnection();
      const [rows] = await conn.execute(
        "SELECT posts.id, posts.author, posts.title, posts.thumbnail, posts.posted_date, posts.short_content, users.username, users.avatar, users.discord_id, squares.name, COUNT(comments.id) AS comment_count FROM posts JOIN users ON posts.author = users.id JOIN squares ON squares.id = posts.square LEFT JOIN comments ON posts.id = comments.post_id WHERE posts.title LIKE ? OR posts.content LIKE ? GROUP BY posts.id ORDER BY posts.posted_date DESC;",
        [`%${query}%`, `%${query}%`]
      );
      conn.release();
      return rows;
    } catch (err) {
      console.error(err);
      return false;
    }
  },

  async getPost(id) {
    try {
      const conn = await pool.getConnection();
      const [rows] = await conn.execute(
        "SELECT posts.*, users.username, users.avatar, users.discord_id, squares.name FROM posts JOIN users ON posts.author = users.id JOIN squares ON squares.id = posts.square WHERE posts.id = ?;",
        [id]
      );
      conn.release();
      return rows[0];
    } catch (err) {
      console.error(err);
      return false;
    }
  },

  async deletePost(id) {
    try {
      const conn = await pool.getConnection();
      await conn.execute("DELETE FROM `posts` WHERE `id` = ?", [id]);
      conn.release();
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  },

  async getComments(id) {
    try {
      const conn = await pool.getConnection();
      const [rows] = await conn.execute(
        "SELECT c.*, u.username, u.discord_id, u.avatar AS user_avatar FROM comments c JOIN users u ON c.user_id = u.id WHERE c.post_id = ? ORDER BY COALESCE(c.parent_id, c.id) DESC, c.created_at ASC;",
        [id]
      );
      conn.release();
      return rows;
    } catch (err) {
      console.error(err);
      return false;
    }
  },

  async getComment(id) {
    try {
      const conn = await pool.getConnection();
      const [rows] = await conn.execute(
        "SELECT * FROM `comments` WHERE `id` = ?",
        [id]
      );
      conn.release();
      return rows[0];
    } catch (err) {
      console.error(err);
      return false;
    }
  },

  async deleteComment(id) {
    const conn = await pool.getConnection();
    await conn.execute("DELETE FROM `comments` WHERE `id` = ?", [id]);
    conn.release();
  },

  async addComment(post_id, user_id, content, parent_id) {
    try {
      const conn = await pool.getConnection();
      await conn.execute(
        "INSERT INTO comments (post_id, user_id, content, parent_id, created_at) VALUES (?, ?, ?, ?, ?)",
        [
          post_id,
          user_id,
          content,
          parent_id,
          dayjs().format("YYYY-MM-DD HH:mm:ss"),
        ]
      );
      conn.release();
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  },

  async follow(follower_id, followed_id) {
    const conn = await pool.getConnection();
    await conn.execute(
      "INSERT IGNORE INTO follows (follower_id, followed_id) VALUES (?, ?)",
      [follower_id, followed_id]
    );
    conn.release();
  },

  async unfollow(follower_id, followed_id) {
    const conn = await pool.getConnection();
    await conn.execute(
      "DELETE FROM follows WHERE follower_id = ? AND followed_id = ?",
      [follower_id, followed_id]
    );
    conn.release();
  },

  async following(user_id) {
    try {
      const conn = await pool.getConnection();
      const [rows] = await conn.execute(
        "SELECT u.id, u.username, u.avatar, u.discord_id FROM follows f JOIN users u ON f.followed_id = u.id WHERE f.follower_id = ?",
        [user_id]
      );
      conn.release();
      return rows;
    } catch (err) {
      console.error(err);
      return false;
    }
  },

  async followers(user_id) {
    try {
      const conn = await pool.getConnection();
      const [rows] = await conn.execute(
        "SELECT u.id, u.username, u.avatar, u.discord_id FROM follows f JOIN users u ON f.follower_id = u.id WHERE f.followed_id = ?",
        [user_id]
      );
      conn.release();
      return rows;
    } catch (err) {
      console.error(err);
      return false;
    }
  },

  async followingPosts(user_id) {
    try {
      const conn = await pool.getConnection();
      const [rows] = await conn.execute(
        "SELECT p.id, p.author, p.title, p.thumbnail, p.posted_date, p.short_content, u.username, u.avatar, u.discord_id, s.name, COUNT(c.id) AS comment_count FROM posts p JOIN follows f ON p.author = f.followed_id JOIN users u ON p.author = u.id JOIN squares s ON s.id = p.square LEFT JOIN comments c ON p.id = c.post_id WHERE f.follower_id = ? GROUP BY p.id ORDER BY p.posted_date DESC;",
        [user_id]
      );
      conn.release();
      return rows;
    } catch (err) {
      console.error(err);
      return false;
    }
  },

  async addPost(title, author, content, thumbnail, square) {
    let short_content = content.replace(/<[^>]*>/g, "").trim();
    if (short_content.length > 240) {
      short_content = short_content.substring(0, 240) + "...";
    }

    try {
      const conn = await pool.getConnection();
      const result = await conn.execute(
        "INSERT INTO `posts`(`id`, `author`, `square`, `title`, `thumbnail`, `content`, `short_content`, `views`, `posted_date`) VALUES (null,?,?,?,?,?,?,0,?)",
        [
          author,
          square,
          title,
          thumbnail,
          content,
          short_content,
          dayjs().format("YYYY-MM-DD HH:mm:ss"),
        ]
      );
      conn.release();
      return result[0].insertId;
    } catch (err) {
      console.error(err.message);
      return false;
    }
  },

  async editPost(title, content, thumbnail, id) {
    let short_content = content.replace(/<[^>]*>/g, "").trim();
    if (short_content.length > 240) {
      short_content = short_content.substring(0, 240) + "...";
    }
    try {
      const conn = await pool.getConnection();
      await conn.execute(
        "UPDATE `posts` SET `title`= ?, `content` = ?, `short_content` = ?, `thumbnail` = ? WHERE `id` = ?",
        [title, content, short_content, thumbnail, id]
      );
      conn.release();
      return true;
    } catch (err) {
      console.error(err.message);
      return false;
    }
  },

  async addLike(user_id, post_id) {
    try {
      const conn = await pool.getConnection();
      await conn.execute("INSERT INTO likes (user_id, post_id) VALUES (?, ?)", [
        user_id,
        post_id,
      ]);
      conn.release();
      return true;
    } catch (err) {
      console.error(err.message);
      return false;
    }
  },

  async removeLike(user_id, post_id) {
    try {
      const conn = await pool.getConnection();
      await conn.execute(
        "DELETE FROM likes WHERE user_id = ? AND post_id = ?",
        [user_id, post_id]
      );
      conn.release();
      return true;
    } catch (err) {
      console.error(err.message);
      return false;
    }
  },

  async getLike(post_id) {
    try {
      const conn = await pool.getConnection();
      const [rows] = await conn.execute(
        "SELECT COUNT(*) AS count FROM likes WHERE post_id = ?",
        [post_id]
      );
      conn.release();
      return rows[0].count;
    } catch (err) {
      console.error(err.message);
      return false;
    }
  },

  async getLikeByUser(post_id, user_id) {
    try {
      const conn = await pool.getConnection();
      const [rows] = await conn.execute(
        "SELECT COUNT(*) AS liked FROM likes WHERE post_id = ? AND user_id = ?",
        [post_id, user_id]
      );
      conn.release();
      return rows[0].liked;
    } catch (err) {
      console.error(err.message);
      return false;
    }
  },

  async updateUser(discord) {
    let avatar = null;
    if (discord.avatar == null) {
      avatar = "https://cdn.discordapp.com/embed/avatars/0.png";
    } else {
      avatar = `https://cdn.discordapp.com/avatars/${discord.id}/${discord.avatar}.png`;
    }

    const conn = await pool.getConnection();
    await conn.execute(
      "UPDATE `users` SET `username`= ?, `locked`= ?, `avatar` = ?, `updated_date` = ? WHERE `discord_id` = ?",
      [discord.username, 0, avatar, dayjs().format("YYYY-MM-DD"), discord.id]
    );
    conn.release();
  },

  async lockUser(discord, number) {
    const conn = await pool.getConnection();
    await conn.execute(
      "UPDATE `users` SET `locked`= ? WHERE `discord_id` = ?",
      [number, discord.id]
    );
    conn.release();
  },

  async addUser(discord) {
    let avatar = null;
    if (discord.avatar == null) {
      avatar = "https://cdn.discordapp.com/embed/avatars/0.png";
    } else {
      avatar = `https://cdn.discordapp.com/avatars/${discord.id}/${discord.avatar}.png`;
    }

    try {
      const conn = await pool.getConnection();
      await conn.execute(
        "INSERT INTO `users`(`id`, `discord_id`, `username`, `email`, `avatar`, `profile`, `locked`, `created_date`, `updated_date`) VALUES (null,?,?,?,?,'プロフィール紹介は自由に変更することができます。',0,?,?)",
        [
          discord.id,
          discord.username,
          discord.email,
          avatar,
          dayjs().format("YYYY-MM-DD"),
          dayjs().format("YYYY-MM-DD"),
        ]
      );
      conn.release();
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  },

  async removeAcc(id) {
    const conn = await pool.getConnection();
    await conn.execute("DELETE FROM `accs` WHERE id = ?", [id]);
    conn.release();
  },
};
