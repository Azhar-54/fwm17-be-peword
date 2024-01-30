const pool = require('../config/db')

const register = ({id, user_id, name, phone }) => {
  return new Promise((resolve, reject) => {
    pool.query(
      "INSERT INTO workers(id, user_id, name, phone)VALUES($1, $2, $3, $4)",
      [id, user_id, name, phone],
      (error, result) => {
        if (!error) {
          resolve(result);
        } else {
          reject(error);
        }
      }
    );
  });
};

const update = ({ name, jobDesk, domicile, workplace, deskription }, id) => {
  return pool.query(
      "UPDATE workers SET name = $1, job_desk = $2, domicile = $3, workplace = $4, description = $5 WHERE user_id = $6", 
      [name, jobDesk, domicile, workplace, deskription, id]
    );
};

const findAll= ()=>{
  return pool.query('SELECT * FROM workers')
}

const countWorkers = () => {
  return pool.query('SELECT COUNT(*) AS total FROM workers')
}

module.exports = {
  register,
  update,
  findAll,
  countWorkers
};
