const router = require('express').Router();
const SocialController = require('../controllers/socialController');
const { authorization } = require('../middlewares/SocialAuthorization');

router.get('/', SocialController.GetAllSocials);

router.get('/:id', SocialController.GetOneSocialById);

router.use('/:id', authorization);

router.post('/', SocialController.CreateSocial);

router.put('/:id', SocialController.UpdateOneSocialById);

router.delete('/:id', SocialController.DeleteOneSocialById);

module.exports = router;
