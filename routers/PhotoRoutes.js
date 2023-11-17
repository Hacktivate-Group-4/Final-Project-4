const router = require('express').Router();
const PhotoController = require('../controllers/photoController');
const { authorization } = require('../middlewares/PhotoAuthorization');

router.get('/', PhotoController.GetAllPhotos);

router.get('/:id', PhotoController.GetOnePhotoById);

router.use('/:id', authorization);

router.post('/', PhotoController.CreatePhoto);

router.put('/:id', PhotoController.UpdateOnePhotoById);

router.delete('/:id', PhotoController.DeleteOnePhotoById);

module.exports = router;
