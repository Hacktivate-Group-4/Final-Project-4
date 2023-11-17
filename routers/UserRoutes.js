const router = require('express').Router();
const UserController = require('../controllers/userControllers');
const { authentication } = require('../middlewares/auth');
const { authorization } = require('../middlewares/UserAuthorization');

router.post('/register', UserController.register);

router.post('/login', UserController.login);

router.delete(
  '/:id',
  [authentication, authorization],
  UserController.DeleteUserById
);

router.put(
  '/:id',
  [authentication, authorization],
  UserController.UpdateUserById
);

module.exports = router;
