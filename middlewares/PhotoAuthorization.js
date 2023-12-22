const { Photo } = require('../models');

function authorization(req, res, next) {
  const photoId = req.params.id;
  const authenticatedUser = res.locals.User;

  if (!authenticatedUser) {
    return res.status(401).json({
      name: 'Unauthorized',
      devMessage: 'User not authenticated',
    });
  }

  Photo.findOne({
    where: {
      id: photoId,
    },
  })
    .then((foundPhoto) => {
      if (!foundPhoto) {
        return res.status(404).json({
          code: 404,
          name: 'Data not found',
          devMessage: `Photo with id ${photoId} not found`,
        });
      }
      if (foundPhoto.UserId === authenticatedUser.id) {
        return next();
      } else {
        return res.status(403).json({
          code: 403,
          name: 'Authorization failed',
          devMessage: `User with id ${foundPhoto.userid} does not have permission to access the photo`,
        });
      }
    })
    .catch((err) => {
      return res.status(500).json(err);
    });
}

module.exports = { authorization };
