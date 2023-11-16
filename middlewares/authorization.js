const { photo } = require("../models");

function authorization(req, res, next) {
  const photoId = req.params.id;
  const authenticatedUser = res.locals.user;

  console.log(`ini auth js user: ${authenticatedUser}`);

  if (!authenticatedUser) {
    return res.status(401).json({
      name: "Unauthorized",
      devMessage: "User not authenticated",
    });
  }

  photo
    .findOne({
      where: {
        id: photoId,
      },
    })
    .then((foundPhoto) => {
      // Mengganti nama variabel lokal dari 'photo' ke 'foundPhoto'
      if (!foundPhoto) {
        return res.status(404).json({
          name: "Data not found",
          devMessage: `Photo with id ${photoId} not found`,
        });
      }
      if (foundPhoto.userid === authenticatedUser.id) {
        return next();
      } else {
        return res.status(403).json({
          name: "Authorization failed",
          devMessage: `User with id ${foundPhoto.userid} does not have permission to access the photo`,
        });
      }
    })
    .catch((err) => {
      return res.status(500).json(err);
    });
}

module.exports = { authorization };
