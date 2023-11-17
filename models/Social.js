// models/socialMedia.js
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class SocialMedia extends Model {
    static associate(models) {
      // Definisikan asosiasi model jika diperlukan
      SocialMedia.belongsTo(models.User, { foreignKey: 'UserId' });
    }
  }
  SocialMedia.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      social_media_url: {
        type: DataTypes.STRING,
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
      modelName: 'SocialMedia',
    }
  );
  return SocialMedia;
};
