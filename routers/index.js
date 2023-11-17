const router = require('express').Router();

const userRoutes = require('./UserRoutes');
const commentRoutes = require('./CommentRoutes');
const socialRoutes = require('./SocialRoutes');
const photoRoutes = require('./PhotoRoutes');
const { authentication } = require('../middlewares/auth');

router.use('/users', userRoutes);

router.use('/photos', authentication, photoRoutes);

router.use('/socials', authentication, socialRoutes);

// router.use('/comments', commentRoutes);

module.exports = router;
