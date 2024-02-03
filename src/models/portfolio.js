const pool = require('../config/db')

const create = ({id, worker_id, application_name, link_repository, app_type, image})=>{
 return pool.query("INSERT INTO portfolio(id, worker_id, application_name, link_repository, app_type, image)VALUES($1, $2, $3, $4, $5, $6)", [id, worker_id, application_name, link_repository, app_type, image])
}

const drop = ({id})=>{
  return pool.query(
    "DELETE FROM portfolio WHERE id = $1", 
    [id]
  );
}

const selectAll = ({worker_id})=>{
  return pool.query("SELECT id,  application_name, link_repository, app_type, image created_at, updated_at FROM portfolio WHERE worker_id = $1", [worker_id])
}

module.exports = {
  create,
  drop,
  selectAll
}