const { Comment } = require('../models');

function authorization(req, res, next) {
  const commentId = req.params.id;
  const authenticatedUser = res.locals.User;

  if (!authenticatedUser) {
    return res.status(401).json({
      name: 'Unauthorized',
      devMessage: 'User not authenticated',
    });
  }

  Comment.findOne({
    where: {
      id: commentId,
    },
  })
    .then((foundcomment) => {
      if (!foundcomment) {
        return res.status(404).json({
          name: 'Data not found',
          devMessage: `comment with id ${commentId} not found`,
        });
      }
      if (foundcomment.UserId === authenticatedUser.id) {
        return next();
      } else {
        return res.status(403).json({
          name: 'Authorization failed',
          devMessage: `User with id ${foundcomment.userid} does not have permission to access the comment`,
        });
      }
    })
    .catch((err) => {
      return res.status(500).json(err);
    });
}

module.exports = { authorization };
