const router = require('express').Router();
const CommentController = require('../controllers/commentController');
const { authorization } = require('../middlewares/CommentAuthorization');

router.get('/', CommentController.GetAllComments);

router.get('/:id', CommentController.GetOneCommentById);

router.use('/:id', authorization);

router.post('/', CommentController.CreateComment);

router.put('/:id', CommentController.UpdateOneCommentById);

router.delete('/:id', CommentController.DeleteOneCommentById);

module.exports = router;
