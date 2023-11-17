// models/photo.js
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Photo extends Model {
    static associate(models) {
      // Definisikan asosiasi model jika diperlukan
      Photo.belongsTo(models.User, { foreignKey: 'UserId' });
    }
  }
  Photo.init(
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      caption: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      poster_image_url: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          isUrl: true, // Validasi URL
        },
      },
      UserId: {
        type: DataTypes.INTEGER,
        references: {
          model: 'User',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
    },
    {
      sequelize,
      modelName: 'Photo',
    }
  );
  return Photo;
};
