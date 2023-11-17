const { verifyToken } = require('../helpers/jwt');

const { User } = require('../models');

const authentication = async (req, res, next) => {
  try {
    const token =
      req.headers['token'] ||
      req.headers['Authorization'] ||
      req.headers['authorization'];

    if (!token) {
      throw {
        code: 401,
        message: 'Token not provided!',
      };
    }

    const decode = verifyToken(token);

    const UserData = await User.findOne({
      where: {
        id: decode.id,
        email: decode.email,
        username: decode.username,
        full_name: decode.full_name,
      },
    });

    if (!UserData) {
      throw {
        code: 401,
        message: 'User not found',
      };
    }

    req.UserData = {
      id: UserData.id,
      email: UserData.email,
      username: UserData.Username,
    };

    if (!res.locals.User) {
      res.locals.User = {};
    }

    res.locals.User = UserData;
    console.log(`ini Userdata ${UserData}`);
    // console.log(`ini locals ${res.locals.User.id}`);
    // console.log(`ini locals ${res.locals.User.username}`);
    // console.log(`ini locals ${res.locals.User.password}`);

    return next();
  } catch (error) {
    res.status(error.code || 500).json(error.message);
  }
};

module.exports = {
  authentication,
};
