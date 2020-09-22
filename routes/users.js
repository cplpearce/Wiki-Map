const express = require('express');
const router  = express.Router();
const { getUsersByEmail } = require('../db/database');

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

  router.get("/:id", (req, res) => {
    const user_id = req.params.id;
    db.query(
      `SELECT name, email, maps.title AS owned_maps, favorite_maps.map_id AS favorites, collaborations.map_id AS collaborations
      FROM users
      LEFT JOIN maps ON owner_id = users.id
      LEFT JOIN favorite_maps ON favorite_maps.user_id = users.id
      LEFT JOIN collaborations ON collaborations.user_id = users.id
      WHERE users.id = $1;`,
      [user_id])
      .then(data => {
        const users = data.rows[0];
        res.json(users);
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });
  return router;
};
