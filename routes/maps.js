const express = require('express');
const router  = express.Router();

const addNewMarkers = (newMarkers, map_id, user_id, db) => {

  const insertedMarkers = [];
  if (!newMarkers) return insertedMarkers;
  for (const marker of newMarkers) {
    const title = marker.title;
    const desc = marker.description;
    const markerPos = `(${marker.lat}, ${marker.lon})`;
    const image_url = marker.image_url;
    db.query(`
    INSERT INTO markers (owner_id, map_id, title, description, location, thumbnail_url)
    VALUES (${user_id}, ${map_id}, $1, $2, point${markerPos}, $3)
    RETURNING *;`
    , [`${title}`, `${desc}`, `${image_url}`])
      .then((insertedMarker) => {
        insertedMarkers.push(insertedMarker);
      })
      .catch();
  }
  return insertedMarkers;
};

const updateMarkers = (points, db) => {
  const updatedMarkers = [];
  for (const point of points) {
    const { description, id, lat, lon, title, image_url} = point;
    const markerPos = `(${lat}, ${lon})`;
    db.query(`
  UPDATE markers
    SET (description, location, title, thumbnail_url, active)
    = ($1, point${markerPos}, $2, $3, TRUE)
    WHERE id = ${id}
    RETURNING *;`
    , [`${description}`, `${title}`, `${image_url}`])
      .then(data => updatedMarkers.push(data));
  }
  return updatedMarkers;
};

const getMapById = (id, db) => {
  return db.query(`
  SELECT * FROM maps WHERE id = ${id};
  `);
};

const sortNewPoints = (points) => {
  const sorted = {
    old : [],
    new : []
  };
  if (!points) return sorted;
  for (const point of points) {
    if (point.id) {
      sorted.old.push(point);
    } else {
      sorted.new.push(point);
    }
  }
  return sorted;
};

module.exports = (db) => {

  ////////////////////
  /// Map specific ///
  ////////////////////


  router.get("/", (req,res) => {
    if (!req.session.user_id) req.session.user_id = 0;
    db.query(`
    SELECT title, date_created, last_updated, share_url,
    EXISTS(SELECT * FROM favorite_maps WHERE user_id = ${req.session.user_id} AND map_id =maps.id) AS favorite,
    EXISTS(SELECT * FROM collaborations WHERE user_id = ${req.session.user_id} AND map_id =maps.id) AS collaborator_on,
    (SELECT COUNT(*) FROM favorite_maps WHERE map_id = maps.id AND active = TRUE AND private = FALSE) AS favorited
    FROM maps
    WHERE active = TRUE AND private = FALSE
    ORDER BY favorited DESC;`)
      .then(data => {
        res.json(data.rows);
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });

  router.post("/", (req, res) => {
    const subGroup = req.body.map_req;
    let queryFilter = "";
    switch (subGroup) {
    case "public-maps":
      queryFilter = `WHERE private = FALSE`;
      break;
    case "my-maps":
      queryFilter = `WHERE owner_id = ${req.session.user_id}`;
      break;
    case "team-maps":
      queryFilter = `LEFT JOIN collaborations ON maps.id = map_id
                     WHERE collaborations.user_id = ${req.session.user_id}`;
      break;
    case "favorite-maps":
      queryFilter = `LEFT JOIN favorite_maps ON map_id = maps.id
                     WHERE favorite_maps.user_id = ${req.session.user_id}`;
      break;
    case "popular":
      //// based on most favorited
      break;
    }
    if (!queryFilter) return new Error("Query did not work");
    db.query(`SELECT title, date_created, last_updated, share_url
              EXISTS(SELECT * FROM favorite_maps WHERE user_id = ${req.session.user_id} AND map_id =maps.id) AS favorite,
              EXISTS(SELECT * FROM collaborations WHERE user_id = ${req.session.user_id} AND map_id =maps.id) AS collaborator_on,
              FROM maps
              ${queryFilter}
              AND active = TRUE;`)
      .then(data => {
        const user_id  = req.session.user_id;
        const maps = data.rows;
        res.json({ maps, user_id });
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });


//// to populate a map
  router.get("/:id/markers", (req, res) => {
    const map_id = req.params.id;
    db.query(
      `SELECT *
      FROM markers
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


///// get map details
  router.get("/:id", (req, res) => {
    const map_id = req.params.id;
    db.query(
      `SELECT *
      FROM maps
      WHERE id = $1 AND maps.active = TRUE;`,
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

  router.post("/create", (req, res) => {
    const mapTitle = req.body.map_name;
    const user_id = req.session.user_id;
    const private = req.body.map_private;
    console.log(mapTitle, user_id, private);
    if (user_id) {
      db.query(
        `INSERT INTO maps (title, owner_id, private)
        VALUES ($1, ${user_id}, ${private})
        RETURNING *;`,
        [mapTitle])
        .then(data => {
          const map_id = data.rows[0].id;
          addNewMarkers(req.body.points, map_id, user_id, db);
          return data;
        })
        .then(data => getMapById(data.rows[0].id, db))
        .then((newMap) => {
          res.json(newMap);
        })
        .catch(err => {
          res
            .status(500)
            .json({ error: err.message });
        });
    } else {
      res.send('please log in to create maps');
    }
  });




  router.post("/:id/favorite", (req, res) => {
    const map_id = req.params.id;
    const user_id = req.session.user_id;

    db.query(`
    INSERT INTO favorite_maps (user_id, map_id)
    VALUES (${user_id}, ${map_id})
    RETURNING *;
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

  //////Update map


  router.put("/:id", (req, res) => {
    const { points, map_name, map_private, team  } = req.body;
    const map_id = req.params.id;
    const user_id = req.session.user_id;
    const sortedPoints = sortNewPoints(points);
    console.log(map_id ,map_name, map_private);
    const updateMap = db.query(`UPDATE maps
                                  SET (title, private) = ($1, $2)
                                  WHERE id = ${map_id};`,
                                  [`${map_name}`, `${map_private}`]);
    db.query(`
    UPDATE markers
      SET (active) = (FALSE)
      WHERE map_id = ${map_id}
    `).then(updateMap)
      .then(updateMarkers(sortedPoints.old, db))
      .then(addNewMarkers(req.body.points, map_id, user_id, db))
      .catch(err => console.log(err));



  });

//   router.put("/:map_id/markers/:marker_id", (req, res) => {
//     const { marker_id } = req.params;
//     const column = 'title'; /// req body
//     const newVal = 'Ipsum 3000'; /// req body

//     db.query(`
//     UPDATE markers
//     SET ${column} = $1
//     WHERE id = ${marker_id}
//     RETURNING id, title, ${column};
//     `, [newVal])
//       .then(data => {
//         const uptMarker = data.rows;
//         res.json(uptMarker);
//       })
//       .catch(err => {
//         res
//           .status(500)
//           .json({ error: err.message });
//       });
//   });

//   router.delete("/:map_id/markers/:marker_id", (req, res) => {
//     const { marker_id } = req.params;

//     db.query(`
//     UPDATE markers
//     SET active = false
//     WHERE id = ${marker_id}
//     RETURNING id, title, active;
//     `)
//       .then(data => {
//         const delMarker = data.rows;
//         res.json(delMarker);
//       })
//       .catch(err => {
//         res
//           .status(500)
//           .json({ error: err.message });
//       });
//   });
  return router;
};
