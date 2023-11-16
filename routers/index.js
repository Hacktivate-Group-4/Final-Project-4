const router = require('express').Router();

const userRoutes = require('./UserRoutes');
const commentRoutes = require('./CommentRoutes');
const socialMedaRoutes = require('./SocialMedaRoutes');
const photoRoutes = require('./PhotoRoutes');
const { authentication } = require('../middlewares/auth');

router.use('/users', userRoutes);

// router.use('/comments', commentRoutes);

// router.use('/socials', socialMedaRoutes);

// router.use('/photos', photoRoutes);

module.exports = router;
