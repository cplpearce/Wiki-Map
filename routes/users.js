const express = require('express');
const router  = express.Router();

module.exports = (db) => {
  router.get("/", (req, res) => {
    db.query(`SELECT * FROM users;`)
      .then(data => {
        const users = data.rows;
        res.json({ users });
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });

  router.get("/user", (req, res) => {
    const user_id = req.session.user_id;

    const getUserInfo = db.query(
      `SELECT *
      FROM users
      WHERE id = ${user_id}
      `);

    const getUserCollab = db.query(`
    SELECT map_id AS collab_map
    FROM collaborations
    WHERE user_id = ${user_id}
    `);

    const getUserFav = db.query(`
    SELECT map_id AS fav_map
    FROM favorite_maps
    WHERE user_id = ${user_id}
    `);
    Promise.all([getUserInfo,getUserCollab, getUserFav])
      .then(data => {
        const [info, collab, fav] = data;
        const profile = {
          info : info.rows[0],
          collab : collab.rows,
          fav : fav.rows
        };
        res.json(profile);
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });
  return router;
};
