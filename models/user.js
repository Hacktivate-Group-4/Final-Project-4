const { Model } = require('sequelize');
const { hashPassword } = require('../helpers/bcrypt');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {}
  }
  User.init(
    {
      full_name: {
        type: DataTypes.STRING,
        allowNull: false, // Validasi notnull
      },
      email: {
        type: DataTypes.STRING,
        unique: true, // Validasi unique
        allowNull: false, // Validasi notnull
        validate: {
          isEmail: true, // Validasi format email
        },
      },
      username: {
        type: DataTypes.STRING,
        unique: true, // Validasi unique
        allowNull: false, // Validasi notnull
        validate: {
          notEmpty: {
            args: true,
            msg: 'Required',
          },
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false, // Validasi notnull
      },
      profile_image_url: {
        type: DataTypes.TEXT,
        allowNull: false, // Validasi notnull
        validate: {
          isUrl: true, // Validasi URL
        },
      },
      age: {
        type: DataTypes.INTEGER,
        allowNull: false, // Validasi notnull
        validate: {
          isInt: true, // Validasi tipe integer
        },
      },
      phone_number: {
        type: DataTypes.STRING,
        allowNull: false, // Validasi notnull
      },
    },
    {
      sequelize,
      modelName: 'User',
      hooks: {
        beforeCreate: (user) => {
          const hashedPassword = hashPassword(user.password);
          user.password = hashedPassword;
        },
      },
    }
  );
  return User;
};
