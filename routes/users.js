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
    if (!user_id) res.send("no login");
    const getUserInfo = db.query(
      `SELECT name, email, location
      FROM users
      WHERE id = ${user_id}
      `);

    const getUserCollab = db.query(`
    SELECT maps.title AS collab_map, map_id
    FROM collaborations
    JOIN maps ON maps.id = map_id
    WHERE user_id = ${user_id}
    `);

    const getUserFav = db.query(`
    SELECT maps.title AS fav_map, map_id
    FROM favorite_maps
    JOIN maps ON maps.id = map_id
    WHERE user_id = ${user_id}
    `);
    Promise.all([getUserInfo,getUserCollab, getUserFav])
      .then(data => {
        const [info, collabs, favs] = data;
        const profile = {
          info : info.rows[0],
          collabs : collabs.rows,
          favs : favs.rows
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
