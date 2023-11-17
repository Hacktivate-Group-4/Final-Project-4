const { User, Photo } = require('../models'); // Change 'user' to 'User'
const { generateToken } = require('../helpers/jwt');
const { comparePassword } = require('../helpers/bcrypt');

class UserController {
  static async getUsers(req, res) {
    try {
      const userData = await User.findAll({
        include: Photo,
      });

      res.status(200).json(userData);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  static async register(req, res) {
    try {
      const {
        full_name,
        profile_image_url,
        age,
        phone_number,
        username,
        email,
        password,
      } = req.body;

      const userData = await User.findOne({
        where: {
          email: email,
        },
      });

      if (userData) {
        throw {
          code: 404,
          message: 'user already registered!',
        };
      }

      const result = await User.create({
        full_name,
        email,
        username,
        password,
        profile_image_url,
        age,
        phone_number,
      });

      res.status(201).json({
        full_name: result.full_name,
        email: result.email,
        username: result.username,
        password: result.password,
        profile_image_url: result.profile_image_url,
        age: result.age,
        phone_number: result.phone_number,
      });
    } catch (error) {
      res.status(500).json(error);
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;

      const userData = await User.findOne({
        where: {
          email: email,
        },
      });

      if (!userData) {
        throw {
          code: 404,
          message: 'user not registered!',
        };
      }

      const isCorrect = comparePassword(password, userData.password);

      if (!isCorrect) {
        throw {
          code: 401,
          message: 'Incorrect password!',
        };
      }

      const token = generateToken({
        id: userData.id,
        email: userData.email,
        username: userData.username,
        full_name: userData.full_name,
      });

      res.status(200).json({
        token,
      });
    } catch (error) {
      res.status(error.code || 500).json(error);
    }
  }

  static async UpdateUserById(req, res) {
    const id = +req.params.id;
    const {
      full_name,
      email,
      username,
      password,
      profile_image_url,
      age,
      phone_number,
    } = req.body;

    try {
      const userData = req.UserData;

      // Only allow the user to update their own data
      if (userData.id !== id) {
        return res.status(403).json({
          message: 'Forbidden: You are not allowed to update this user.',
        });
      }

      const [updatedRowsCount, updatedRows] = await User.update(
        {
          full_name,
          email,
          username,
          password,
          profile_image_url,
          age,
          phone_number,
        },
        {
          where: {
            id,
          },
          returning: true,
        }
      );

      if (updatedRowsCount > 0) {
        res.status(200).json(updatedRows[0]);
      } else {
        res.status(404).json({ message: `User with id ${id} not found` });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async DeleteUserById(req, res) {
    const id = +req.params.id;

    try {
      const userData = req.UserData;

      // Only allow the user to delete their own data
      if (userData.id !== id) {
        return res.status(403).json({
          message: 'Forbidden: You are not allowed to delete this user.',
        });
      }

      const deletedRowCount = await User.destroy({
        where: {
          id,
        },
      });

      if (deletedRowCount > 0) {
        res
          .status(200)
          .json({ message: `User with id ${id} deleted successfully` });
      } else {
        res.status(404).json({ message: `User with id ${id} not found` });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = UserController;
