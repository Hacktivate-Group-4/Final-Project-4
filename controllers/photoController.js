const { Photo, User, Comment } = require('../models');

class PhotoController {
  static GetAllPhotos(req, res) {
    Photo.findAll({
      include: [Comment, User],
    })
      .then((result) => {
        if (result.length === 0) {
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
    Photo.findByPk(id)
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

  static UpdateOnePhotoById(req, res) {
    let id = +req.params.id;
    const { title, caption, poster_image_url } = req.body;
    const userData = req.UserData;
    let data = {
      title,
      caption,
      poster_image_url,
      UserId: userData.id,
    };
    Photo.update(data, {
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

    Photo.destroy({
      where: {
        id,
      },
    })
      .then((result) => {
        if (result === 1) {
          res.status(200).json({ message: `Data dengan ID ${id} berhasil dihapus.` });
        } else {
          res.status(404).json({ message: `Data dengan ID ${id} tidak ditemukan.` });
        }
      })
      .catch((err) => {
        res.status(500).json({ message: err.message });
      });
  }

  static async CreatePhoto(req, res) {
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
