// models/comment.js
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Comment extends Model {
    static associate(models) {
      // Definisikan asosiasi model jika diperlukan
      Comment.belongsTo(models.User, { foreignKey: 'UserId' });
      Comment.belongsTo(models.Photo, { foreignKey: 'PhotoId' });
    }
  }
  Comment.init(
    {
      comment: {
        type: DataTypes.TEXT,
        allowNull: false,
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
      PhotoId: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Photo',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
    },
    {
      sequelize,
      modelName: 'Comment',
    }
  );
  return Comment;
};
