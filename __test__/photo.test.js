const request = require('supertest');
const app = require('../index');
const { User } = require('../models');
const { verifyToken } = require('../helpers/jwt');

describe('Authentication', () => {
  let token = '';
  let userData;
  const user = {
    full_name: 'John Doe',
    email: 'john@gmail.com',
    username: 'johndoe',
    password: 'password123',
    profile_image_url:
      'https://plus.unsplash.com/premium_photo-1700782893131-1f17b56098d0?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxlZGl0b3JpYWwtZmVlZHwyfHx8ZW58MHx8fHx8',
    age: 12,
    phone_number: '123456789',
  };

  beforeAll(async () => {
    await User.destroy({ where: { email: user.email } });
    await request(app).post('/users/register').send(user);
    await request(app).post('/users/login').send(user);
    const userLogin = await request(app).post('/users/login').send(user);
    const decodedToken = verifyToken(userLogin.body.token);
    token = userLogin.body.token;
    userData = decodedToken;
  });

  describe('POST /photos', () => {});
});
