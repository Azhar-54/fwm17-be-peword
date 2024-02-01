const createError = require("http-errors");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const workers = require("../models/workers");
const users = require('../models/users')

const { response } = require("../helpers/common");
const register = async (req, res, next) => {
  try {
    const { email, password, name, phone } = req.body;
    const { rowCount } = await users.findByEmail(email, {relation: 'workers'});
    if (rowCount) {
      return next(createError(403, "user sudah terdaftar"));
    }
    const salt = bcrypt.genSaltSync(10);
    const passwrodHash = bcrypt.hashSync(password, salt);

    const user = {
      id: uuidv4(),
      email,
      password: passwrodHash,
    };
    const worker = {
      id: uuidv4(),
      name,
      user_id: user.id,
      phone
    }
    await users.create(user)
    await workers.register(worker);

    response(res, null, 201, 'user berhasil resgiter')
  } catch (error) {
    console.log(error)
    next(new createError.InternalServerError())
  }
};

const update = async (req, res, next) => {
  try {
    const email = req.decoded.email;
    const  { rows: [user] } = await users.findByEmail(email);
    const { name, jobDesk, domicile, workplace, description } = req.body;
    const data = {
      name,
      jobDesk,
      domicile,
      workplace,
      description,
    };
    await workers.update(data, user.user_id);
    response(res, data, 200, "update profile workers success ");
    
  } catch (error) {
    console.log(error)
    next(new createError.InternalServerError())
  }
};


const profile = async (req, res, next)=>{
  try {
    const email = req.decoded.email 
    const  { rows: [user] } = await users.findByEmail(email, {relation: 'workers'});
    if(!user){
      return next(new createError[403])
    }
    delete user.password
    response(res, user, 200, 'get workers success')
  } catch (error) {
    console.log(error)
    next(new createError.InternalServerError())
  }
}

const selectAll = async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const sort = req.query.sort || "name";
  const sortBy = req.query.sortBy || "ASC";
  const search = req.query.search || "";
  const offset = (page - 1) * limit;
  const { rows } = await workers.findAll({
    limit,
    offset,
    search,
    sort,
    sortBy,
  });
  const { rows: [count] } = await workers.countWorkers({search})
  const totalData = parseInt(count.total)
  const totalPage = Math.ceil(totalData / limit)
  const pagination = {
    currentPage: page,
    limit,
    totalData,
    totalPage
  };
  response(res, rows, 200, 'success get data workers', pagination)
};

module.exports = {
  register,
  update,
  selectAll,
  profile
};
