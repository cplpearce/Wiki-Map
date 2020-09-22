const bcrypt = require('../node_modules/bcrypt-pbkdf');

const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});



const getUserWithEmail = function(email) {
  return pool.query(`
    SELECT users.*
    FROM users
    WHERE email = $1;
    `, [`${email}`])
    .then(res => res.rows[0])
    .catch(err => err);
};



module.exports = {
  getUserWithEmail
};
