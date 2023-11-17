const { SocialMedia } = require('../models');

function authorization(req, res, next) {
  const socialId = req.params.id;
  const authenticatedUser = res.locals.User;

  if (!authenticatedUser) {
    return res.status(401).json({
      name: 'Unauthorized',
      devMessage: 'User not authenticated',
    });
  }

  SocialMedia.findOne({
    where: {
      id: socialId,
    },
  })
    .then((foundsocial) => {
      if (!foundsocial) {
        return res.status(404).json({
          name: 'Data not found',
          devMessage: `social with id ${socialId} not found`,
        });
      }
      if (foundsocial.UserId === authenticatedUser.id) {
        return next();
      } else {
        return res.status(403).json({
          name: 'Authorization failed',
          devMessage: `User with id ${foundsocial.userid} does not have permission to access the social`,
        });
      }
    })
    .catch((err) => {
      return res.status(500).json(err);
    });
}

module.exports = { authorization };
