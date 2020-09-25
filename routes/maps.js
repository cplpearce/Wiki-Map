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

const getUsersIdName = (db) => {
  return db.query(`
    SELECT id, name FROM users
  `);
};

const getCollabNames = (map_id, db) => {
  return db.query(`
    SELECT name FROM users
    JOIN collaborations ON user_id = users.id
    JOIN maps ON map_id = maps.id
    WHERE maps.id = $1;
  `, [map_id]);
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

const compareTable = (objects, arr) => {
  const result = arr.map(element => {
    for (const object of objects) {
      if (object.name === element) {
        return object.id;
      }
    }
  });
  return result;
};

const generatePairs = (team, map_id, db) => {
  return getUsersIdName(db)
    .then(usertable => {
      const usernames = team.split(",");
      const pairs = [];
      const userIds = compareTable(usertable.rows, usernames);

      for (const userId of userIds) {
        pairs.push([userId, Number(map_id)]);
      }
      return pairs;
    });
};

const updateCollab = (team, map_id, db) => {
  return generatePairs(team, map_id, db)
    .then(collabPairs => {
      for (const pair of collabPairs) {
        collabQuery(pair, db);
      }
    });
};


const collabQuery = (pair, db) => {
  if (!pair[0]) return 'done';
  const [ user_id, map_id ] = pair;
  db.query(`
  SELECT EXISTS (SELECT * FROM collaborations WHERE map_id = $1 AND user_id = ${user_id})
  `, [map_id])
    .then(data => {
      if (!data.rows[0].exists) {
        db.query(`
        INSERT INTO collaborations (user_id, map_id)
        VALUES (${user_id}, ${map_id})
        RETURNING *;
        `);
      } else {
        db.query(`
        DELETE FROM collaborations
        WHERE user_id = ${user_id} AND map_id = ${map_id}
        RETURNING *;
        `);
      }
    });
};

module.exports = (db) => {

  ////////////////////
  /// Map specific ///
  ////////////////////


  router.get("/", (req,res) => {
    const { user_id = 0 }  = req.session;
    db.query(`
    SELECT DISTINCT ON (id) id, title, date_created, last_updated, share_url, map_thumb
    EXISTS(SELECT * FROM favorite_maps WHERE user_id = ${user_id} AND map_id =maps.id) AS favorite,
    EXISTS(SELECT * FROM collaborations WHERE user_id = ${user_id} AND map_id =maps.id) AS collaborator_on,
    EXISTS(SELECT * FROM users WHERE users.id = maps.owner_id AND users.id = ${user_id}) AS is_owner,
    private AS is_private,
    (SELECT COUNT(*) FROM favorite_maps WHERE map_id = maps.id AND active = TRUE) AS favorited
    FROM maps
    LEFT JOIN collaborations ON map_id = maps.id
    WHERE active = TRUE AND (private = FALSE OR owner_id = ${user_id} OR collaborations.user_id = ${user_id});`)
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
    const { user_id = 0 } = req.session;
    let queryFilter = "";
    switch (subGroup) {
    case "public-maps":
      queryFilter = `WHERE private = FALSE`;
      break;
    case "my-maps":
      queryFilter = `WHERE owner_id = ${user_id}`;
      break;
    case "team-maps":
      queryFilter = `LEFT JOIN collaborations ON maps.id = map_id
                     WHERE collaborations.user_id = ${user_id}`;
      break;
    case "favorite-maps":
      queryFilter = `LEFT JOIN favorite_maps ON map_id = maps.id
                     WHERE favorite_maps.user_id = ${user_id}`;
      break;
    }
    if (!queryFilter) return new Error("Query did not work");
    db.query(`SELECT id, title, date_created, last_updated, share_url, map_thumb,
              EXISTS(SELECT * FROM favorite_maps WHERE user_id = ${user_id} AND map_id =maps.id) AS favorite,
              EXISTS(SELECT * FROM collaborations WHERE user_id = ${user_id} AND map_id =maps.id) AS collaborator_on,
              EXISTS(SELECT * FROM users WHERE users.id = maps.owner_id AND users.id = ${user_id}) AS is_owner
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
    const getMapDetails = db.query(
      `SELECT *
      FROM maps
      WHERE id = $1 AND maps.active = TRUE;`,
      [map_id]);

    const collabName = getCollabNames(map_id, db);

    Promise.all([getMapDetails, collabName])
      .then(data => res.json({ maps : data[0].rows[0], collaborators : data[1].rows }))
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });


  ///Creat new map

  router.post("/create", (req, res) => {
    const { points, map_name, map_private, team, map_thumb  } = req.body;
    console.log(req.body)
    const mapTitle = req.body.map_name;
    const { user_id = 0 }  = req.session;
    if (user_id) {
      db.query(
        `INSERT INTO maps (title, owner_id, private, map_thumb)
        VALUES ($1, ${user_id}, ${map_private}, $3)
        RETURNING *;`,
        [mapTitle, `${map_thumb}`])
        .then(data => {
          const map_id = data.rows[0].id;
          addNewMarkers(req.body.points, map_id, user_id, db);
          return data;
        })
        .then(data => {
          const map_id = data.rows[0].id;
          updateCollab(team, map_id, db);
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
    const { user_id = 0 }  = req.session;
    if (user_id) {
      db.query(`
      SELECT EXISTS (SELECT * FROM favorite_maps WHERE map_id = $1 AND user_id = ${user_id})
      `, [map_id])
        .then(data => {
          if (!data.rows[0].exists) {
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
          } else {
            db.query(`
            DELETE FROM favorite_maps
            WHERE user_id = ${user_id} AND map_id = ${map_id}
            RETURNING *;
            `)
              .then(data => {
                const delRow = data.rows;
                res.json(delRow);
              })
              .catch(err => {
                res
                  .status(500)
                  .json({ error: err.message });
              });
          }
        });
    } else {
      res.send('please log in to create maps');
    }

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
    const { user_id = 0 }  = req.session;
    const sortedPoints = sortNewPoints(points);



    updateCollab(team, map_id, db);

    const updateMap = () => {
      return db.query(`UPDATE maps
      SET (title, private) = ($1, $2)
      WHERE id = ${map_id};`,
      [`${map_name}`, `${map_private}`]);
    };

    db.query(`
    UPDATE markers
      SET active = FALSE
      WHERE map_id = ${map_id}
      RETURNING *;
    `).then(updateMap())
      .then(updateMarkers(sortedPoints.old, db))
      .then(() => {
        addNewMarkers(sortedPoints.new, map_id, user_id, db);
        res.status(200);
      })
      .catch(err => console.log(err));
  });
  return router;
};
