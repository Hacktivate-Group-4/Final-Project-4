const { verifyToken } = require("../helpers/jwt");

const { user } = require("../models");

const authentication = async (req, res, next) => {
  try {
    const token = req.headers["token"];
    if (!token) {
      throw {
        code: 401,
        message: "Token not provided!",
      };
    }

    const decode = verifyToken(token);

    const userData = await user.findOne({
      where: {
        id: decode.id,
        email: decode.email,
      },
    });

    if (!userData) {
      throw {
        code: 401,
        message: "User not found",
      };
    }

    req.UserData = {
      id: userData.id,
      email: userData.email,
      username: userData.username,
    };

    if (!res.locals.user) {
      res.locals.user = {};
    }

    res.locals.user = userData;
    console.log(`ini userdata ${userData}`);
    console.log(`ini locals ${res.locals.user.id}`);
    console.log(`ini locals ${res.locals.user.username}`);
    console.log(`ini locals ${res.locals.user.password}`);

    return next();
  } catch (error) {
    res.status(error.code || 500).json(error.message);
  }
};

module.exports = {
  authentication,
};
