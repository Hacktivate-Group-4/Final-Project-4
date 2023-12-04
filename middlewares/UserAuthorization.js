const { User } = require('../models');

function authorization(req, res, next) {
  const userId = req.params.id;
  const authenticatedUser = res.locals.User;

  if (!authenticatedUser) {
    return res.status(401).json({
      name: 'Unauthorized',
      devMessage: 'User not authorized',
    });
  }

  User.findOne({
    where: {
      id: userId,
    },
  })
    .then((founduser) => {
      if (!founduser) {
        return res.status(404).json({
          name: 'Data not found',
          devMessage: `user with id ${userId} not found`,
        });
      }
      // console.log(founduser.id === authenticatedUser.id);
      if (founduser.id === authenticatedUser.id) {
        return next();
      } else {
        return res.status(403).json({
          name: 'Authorization failed',
          devMessage: `User with id ${founduser.userid} does not have permission to access the user`,
        });
      }
    })
    .catch((err) => {
      return res.status(500).json(err);
    });
}

module.exports = { authorization };
