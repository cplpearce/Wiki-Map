const express = require('express');
const router  = express.Router();

const addNewPoint = (point, db) => { //TAKES AN OBJECT WITH INFO ABOUT THE POINT

  const map_id = 1; /// point.map_id;
  const user_id = 1; //point.[some clue about the user]
  const title = "Ipsum cafe"; // point.body
  const desc = "Ipsum is good"; // point.body
  const markerPos = '(50, 50)'; // point.body
  const thumbnailUrl = "https://picsum.photos/200"; //point.body

  return db.query(`
  INSERT INTO markers (owner_id, map_id, title, description, location, thumbnail_url)
  VALUES (${user_id}, ${map_id}, $1, $2, point${markerPos}, '${thumbnailUrl}')
  RETURNING *
  `, [`${title}`, `${desc}`]);
};

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


  ///Creat new map

  router.post("/", (req, res) => {
    const mapTitle = "Ipsmap"; /// req.body
    const user_id = 1; //req.[some clue about the user]
    db.query(
      `INSERT INTO maps (title, user_id)
       VALUES ($1, ${user_id})
       RETURNING *;`,
      [mapTitle])
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

  router.delete("/:map_id", (req, res) => {
    const { map_id } = req.params;

    db.query(`
    UPDATE maps
    SET active = false
    WHERE id = ${map_id}
    RETURNING id, title, active;
    `)
      .then(data => {
        const delMap = data.rows;
        res.json(delMap);
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

    const point = {
      ////Object [point] crafted here from [req]
    };



    ////Wrapped in a loop
    addNewPoint(point, db) ///METTONS
      .then(data => {
        const newPoints = data.rows;
        res.json(newPoints);
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
        const uptMarker = data.rows;
        res.json(uptMarker);
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
        const delMarker = data.rows;
        res.json(delMarker);
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });
  return router;
};
