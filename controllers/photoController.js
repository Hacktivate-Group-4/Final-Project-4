const { Photo, User } = require('../models');

class PhotoController {
  static GetAllPhotos(req, res) {
    Photo.findAll({
      include: User,
    })
      .then((result) => {
        if (result.length === 0) {
          // Tidak ada data photo yang ditemukan
          res.status(404).json({ message: 'Belum ada data photo.' });
        } else {
          res.status(200).json(result);
        }
      })
      .catch((err) => {
        res.status(500).json({ message: err.message });
      });
  }

  static GetOnePhotoById(req, res) {
    let id = +req.params.id;
    photo
      .findByPk(id)
      .then((result) => {
        if (result) {
          res.status(200).json(result);
        } else {
          res.status(404).json({ message: 'Not Found' });
        }
      })
      .catch((err) => {
        res.status(500).json({ message: err.message });
      });
  }

  static CreatePhoto(req, res) {
    const { title, caption, image_url } = req.body;
    const user = req.locals.user;
    console.log(`ini photo ${res.locals.user}`);
    console.log(`ini photo ${req.locals.user}`);

    photo
      .create({
        title,
        caption,
        image_url,
        userId: user.id,
      })
      .then((result) => {
        res.status(200).json(result);
      })
      .catch((err) => {
        res.status(500).json({ message: err.message });
      });
  }

  static UpdateOnePhotoById(req, res) {
    let id = +req.params.id;
    const { title, caption, image_url } = req.body;

    let data = {
      title,
      caption,
      image_url,
      userId,
    };
    photo
      .update(data, {
        where: {
          id,
        },
        returning: true,
      })
      .then((result) => {
        res.status(200).json(result);
      })
      .catch((err) => {
        res.status(500).json({ message: err.message });
      });
  }

  static DeleteOnePhotoById(req, res) {
    let id = +req.params.id;

    photo
      .destroy({
        where: {
          id,
        },
      })
      .then((result) => {
        res.status(200).json(result);
      })
      .catch((err) => {
        res.status(500).json({ message: err.message });
      });
  }

  static async addPhoto(req, res) {
    try {
      const { title, caption, poster_image_url } = req.body;

      const userData = req.UserData;

      const data = await Photo.create({
        title,
        caption,
        poster_image_url,
        UserId: userData.id,
      });

      res.status(201).json(data);
    } catch (error) {
      res.status(500).json(error);
    }
  }
}

module.exports = PhotoController;
