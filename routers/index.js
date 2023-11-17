const router = require('express').Router();

const userRoutes = require('./UserRoutes');
const commentRoutes = require('./CommentRoutes');
const socialMedaRoutes = require('./SocialRoutes');
const photoRoutes = require('./PhotoRoutes');
const { authentication } = require('../middlewares/auth');

router.use('/users', userRoutes);

router.use('/photos', authentication, photoRoutes);

// router.use('/comments', commentRoutes);

// router.use('/socials', socialMedaRoutes);

module.exports = router;
