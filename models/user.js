'use strict';
const { Model } = require('sequelize');
const { hashPassword } = require('../helpers/bcrypt');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {}
  }
  User.init(
    {
      full_name: DataTypes.STRING,
      email: DataTypes.STRING,
      username: {
        type: DataTypes.STRING,
        validate: {
          notEmpty: {
            args: true,
            msg: 'Required',
          },
        },
      },
      password: DataTypes.STRING,
      profile_image_url: DataTypes.TEXT,
      age: DataTypes.INTEGER,
      phone_number: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: 'User',
      hooks: {
        beforeCreate: (User) => {
          const hashedPassword = hashPassword(User.password);
          User.password = hashedPassword;
        },
      },
    }
  );
  return User;
};
