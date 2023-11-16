'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Users', [
      {
        full_name: 'John Doe',
        email: 'john@example.com',
        username: 'john_doe',
        password: 'password123',
        profile_image_url: 'https://example.com/john.jpg',
        age: 30,
        phone_number: '123456789',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        full_name: 'Jane Smith',
        email: 'jane@example.com',
        username: 'jane_smith',
        password: 'password456',
        profile_image_url: 'https://example.com/jane.jpg',
        age: 25,
        phone_number: '987654321',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        full_name: 'Bob Johnson',
        email: 'bob@example.com',
        username: 'bob_johnson',
        password: 'password789',
        profile_image_url: 'https://example.com/bob.jpg',
        age: 35,
        phone_number: '456789123',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Users', null, {});
  },
};
