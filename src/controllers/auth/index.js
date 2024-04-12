const joi = require("joi");
const createError = require("http-errors");
const users = require("../../models/users");
const authHelper = require("../../helpers/auth");
const bcrypt = require("bcryptjs");
const commonHelper = require("../../helpers/common");
const {loginSchema} = require('./request_model');

const login = async (req, res, next) => {
  try {
    const {value, error} = loginSchema(req.body)

    if(error){
      return next(new createError.BadRequest(error.details[0].message))
    }
    const { email, password } = value;
    const {
      rows: [user],
    } = await users.findByEmail(email);
    if (!user) {
      return commonHelper.response(
        res,
        null,
        403,
        "email atau password anda salah"
      );
    }
    const validPassword = bcrypt.compareSync(password, user.password);
    if (!validPassword) {
      return commonHelper.response(
        res,
        null,
        403,
        "email atau password anda salah"
      );
    }
    delete user.password;

    const payload = {
      email: user.email,
      role: user.role,
    };
    // generate token
    user.token = authHelper.generateToken(payload);
    user.refreshToken = authHelper.gerateRefreshToken(payload);
    res.cookie("token", user.token, {
      httpOnly: true,
      maxAge: 60 * 1000 * 60 * 12,
      secure: false,
      path: "/",
      sameSite: "Lax",
    });
    
    commonHelper.response(res, user, 201, "anda berhasil login");
  } catch (error) {
    console.log(error);
    next(new createError.InternalServerError());
  }
};

const logout = async (req, res, next) => {
  res.clearCookie("token");
  commonHelper.response(res, null, 200, "Logout Success");
};

const checkRole = (req,res, next)=>{
  try {
    const {iat, exp, ...data} = req.decoded
    commonHelper.response(res, {data}, 200, "check role success");
  } catch (error) {
    console.log(error);
    next(error);
  }
}

module.exports = {
  login,
  logout,
  checkRole
};
