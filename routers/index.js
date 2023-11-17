const router = require('express').Router();

const userRoutes = require('./UserRoutes');
const commentRoutes = require('./CommentRoutes');
const socialRoutes = require('./SocialRoutes');
const photoRoutes = require('./PhotoRoutes');
const { authentication } = require('../middlewares/auth');

router.get('/', (req, res) => {
  res.status(200).json({ message: 'Selamat datang di MyGram API!' });
});

router.use('/users', userRoutes);

router.use('/photos', authentication, photoRoutes);

router.use('/socials', authentication, socialRoutes);

router.use('/comments', authentication, commentRoutes);

module.exports = router;
