const express = require('express');
const router  = express.Router();
const app        = express();


module.exports = (db) => {
  router.post("/", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    db.query(`
    SELECT id, name, password
    FROM users
    WHERE name = $1;`
    ,[username])
      .then(data => {
        console.log(data.rows[0]);
        if (!data.rows[0] || data.rows[0].password !== password) {
          res
            .status(401)
            .send('authentification failed');
        } else {
          req.session.user_id = data.rows[0].id;
          res.send("Login Sucessful");
        }
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });

  router.post("/logout", (req, res) => {
    req.session = null;
    res.redirect("/");
  });

  router.post("/register", (req, res) => {
    const username = 'Userina'; /// req.body
    const email = 'userina@gmail.com'; //req.[some clue about the user]
    const password = 'password'; /// req.body
    const location = '(50, 50)';
    db.query(
      `INSERT INTO users (name, email, password, location)
       VALUES ($1, $2, $3, point${location})
       RETURNING *;`,
      [username, email, password])
      .then(data => {
        const newMap = data.rows;
        res.json(newMap);
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });
  return router;
};
