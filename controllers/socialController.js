const { SocialMedia, User } = require("../models");

class SocialController {
  static GetAllSocials(req, res) {
    SocialMedia.findAll({
      include: User,
    })
      .then((result) => {
        if (result.length === 0) {
          res.status(404).json({ 
            code: 404,
            message: "Belum ada data social media." });
        } else {
          res.status(200).json(result);
        }
      })
      .catch((err) => {
        res.status(500).json({ message: err.message });
      });
  }

  static GetOneSocialById(req, res) {
    let id = +req.params.id;
    SocialMedia.findByPk(id)
      .then((result) => {
        if (result) {
          res.status(200).json(result);
        } else {
          res.status(404).json({
            code: 404,
            message: "Not Found" });
        }
      })
      .catch((err) => {
        res.status(500).json({ message: err.message });
      });
  }

  static async UpdateOneSocialById(req, res) {
    let id = +req.params.id;
    const { name, social_media_url } = req.body;
    console.log(name);
    // Validate that required fields are present
    if (!name || !social_media_url) {
      return res.status(400).json({
        code: 400,
        name: "required fields not provided!",
        message: "name and social_media_url required fields.",
      });
    }
    const userData = req.UserData;
    let data = {
      name,
      social_media_url,
      UserId: userData.id,
    };
    try {
      const result = await SocialMedia.update(data, {
        where: {
          id,
        },
        returning: true,
      });
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  static DeleteOneSocialById(req, res) {
    let id = +req.params.id;

    SocialMedia.destroy({
      where: {
        id,
      },
    })
      .then((result) => {
        if (result === 1) {
          res
            .status(200)
            .json({ message: `Data dengan ID ${id} berhasil dihapus.` });
        } else {
          res
            .status(404)
            .json({ message: `Data dengan ID ${id} tidak ditemukan.` });
        }
      })
      .catch((err) => {
        res.status(500).json({ message: err.message });
      });
  }

  static async CreateSocial(req, res) {
    try {
      const { name, social_media_url } = req.body;
      // Validate that required fields are present
      if (!name || !social_media_url) {
        return res.status(400).json({
          code: 400,
          message: "name and social_media_url required fields.",
          data: req.body,
        });
      }
      const userData = req.UserData;

      const data = await SocialMedia.create({
        name,
        social_media_url,
        UserId: userData.id,
      });

      res.status(201).json(data);
    } catch (error) {
      res.status(500).json(error);
    }
  }
}

module.exports = SocialController;
