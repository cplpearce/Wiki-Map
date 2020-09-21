const express = require('express');
const router  = express.Router();

module.exports = (db) => {

  ////////////////////
  /// Map specific ///
  ////////////////////

  router.get("/", (req, res) => {
    db.query(`SELECT * FROM maps;`)
      .then(data => {
        const maps = data.rows;
        res.json({ maps });
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });

  router.get("/:id", (req, res) => {
    const map_id = req.params.id;
    db.query(
      `SELECT maps.title AS map_title, maps.id AS map_id, markers.*
      FROM markers
      JOIN maps ON map_id = maps.id
      WHERE map_id = $1 AND markers.active = TRUE;`,
      [map_id])
      .then(data => {
        const users = data.rows;
        res.json(users);
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });

  router.post("/:id/favorite", (req, res) => {
    const map_id = req.params.id;
    const user_id = 1; //req.[some clue about the user]

    db.query(`
    INSERT INTO favorite_maps (user_id, map_id)
    VALUES (${user_id}, ${map_id})
    RETURNING*;
    `)
      .then(data => {
        const newMatch = data.rows;
        res.json(newMatch);
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });

  ////////////////////////
  /// Marker specific ///
  ////////////////////////

  router.post("/:map_id/markers/", (req, res) => {
    ////Wrapped in a loop
    const map_id = req.params.map_id;
    const user_id = 1; //req.[some clue about the user]
    const title = "Ipsum cafe"; // req.body
    const desc = "Ipsum is good"; // req.body
    const markerPos = '(50, 50)'; // req.body
    const thumbnailUrl = "https://picsum.photos/200"; //req.body

    db.query(`
    INSERT INTO markers (owner_id, map_id, title, description, location, thumbnail_url)
    VALUES (${user_id}, ${map_id}, $1, $2, point${markerPos}, '${thumbnailUrl}')
    RETURNING *
    `, [`${title}`, `${desc}`])
      .then(data => {
        const newMatch = data.rows;
        res.json(newMatch);
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });

  router.put("/:map_id/markers/:marker_id", (req, res) => {
    const { marker_id } = req.params;
    const column = 'title'; /// req body
    const newVal = 'Ipsum 3000'; /// req body

    db.query(`
    UPDATE markers
    SET ${column} = $1
    WHERE id = ${marker_id}
    RETURNING id, title, ${column};
    `, [newVal])
      .then(data => {
        const newMatch = data.rows;
        res.json(newMatch);
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });

  router.delete("/:map_id/markers/:marker_id", (req, res) => {
    const { marker_id } = req.params;

    db.query(`
    UPDATE markers
    SET active = false
    WHERE id = ${marker_id}
    RETURNING id, title, active;
    `)
      .then(data => {
        const newMatch = data.rows;
        res.json(newMatch);
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });
  return router;
};
