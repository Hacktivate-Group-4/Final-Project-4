const { user, Photo } = require("../models");
const { generateToken } = require("../helpers/jwt");

const { comparePassword } = require("../helpers/bcrypt");

class UserController {
  static async getUsers(req, res) {
    try {
      const userData = await user.findAll({
        include: Photo,
      });

      res.status(200).json(userData);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  static async register(req, res) {
    try {
      const { username, email, password } = req.body;
      const result = await user.create({
        username,
        email,
        password,
      });

      res.status(201).json({
        id: result.id,
        username: result.username,
        email: result.email,
      });
    } catch (error) {
      res.status(500).json(error);
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;

      const userData = await user.findOne({
        where: {
          email: email,
        },
      });

      if (!userData) {
        throw {
          code: 404,
          message: "user not registered!",
        };
      }

      const isCorrect = comparePassword(password, userData.password);

      if (!isCorrect) {
        throw {
          code: 401,
          message: "Incorrect password!",
        };
      }

      const token = generateToken({
        id: userData.id,
        email: userData.email,
        username: userData.username,
      });

      res.status(200).json({
        token,
      });
    } catch (error) {
      res.status(error.code || 500).json(error);
    }
  }
}

module.exports = UserController;
