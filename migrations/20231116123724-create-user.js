'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      full_name: {
        type: Sequelize.STRING,
        allowNull: false, // Validasi notnull
      },
      email: {
        type: Sequelize.STRING,
        unique: true, // Validasi unique
        allowNull: false, // Validasi notnull
        validate: {
          isEmail: true, // Validasi format email
        },
      },
      username: {
        type: Sequelize.STRING,
        unique: true, // Validasi unique
        allowNull: false, // Validasi notnull
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false, // Validasi notnull
      },
      profile_image_url: {
        type: Sequelize.TEXT,
        allowNull: false, // Validasi notnull
        validate: {
          isUrl: true, // Validasi URL
        },
      },
      age: {
        type: Sequelize.INTEGER,
        allowNull: false, // Validasi notnull
        validate: {
          isInt: true, // Validasi tipe integer
        },
      },
      phone_number: {
        type: Sequelize.STRING,
        allowNull: false, // Validasi notnull
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Users');
  },
};
