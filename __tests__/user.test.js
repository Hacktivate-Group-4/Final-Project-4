const request = require('supertest');
const app = require('../index');
const { User } = require('../models');
const { verifyToken } = require('../helpers/jwt');

describe('Authentication', () => {
  const user = {
    full_name: 'John Doe',
    email: 'john@example.com',
    username: 'johndoe',
    password: 'password123',
    profile_image_url:
      'https://plus.unsplash.com/premium_photo-1700782893131-1f17b56098d0?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxlZGl0b3JpYWwtZmVlZHwyfHx8ZW58MHx8fHx8',
    age: 12,
    phone_number: '123456789',
  };

  beforeAll(async () => {
    await User.destroy({ where: { email: user.email } });
  });
  afterAll(async () => {
    await User.destroy({ where: { email: user.email } });
  });

  describe('POST /users/register', () => {
    it('should register a new user and return user data', async () => {
      const response = await request(app).post('/users/register').send(user);
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('full_name', user.full_name);
      expect(response.body).toHaveProperty('email', user.email);
      expect(response.body).toHaveProperty(
        'profile_image_url',
        user.profile_image_url
      );
      expect(response.body).toHaveProperty('age', user.age);
      expect(response.body).toHaveProperty('phone_number', user.phone_number);
    });

    it('should return an error when the email is already registered', async () => {
      const response = await request(app).post('/users/register').send(user);
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('code', 404);
      expect(response.body).toHaveProperty(
        'message',
        'user already registered!'
      );
    });
  });

  describe('POST /users/login', () => {
    it('should log in a user and return a token', async () => {
      const response = await request(app)
        .post('/users/login')
        .send({ email: 'john@example.com', password: 'password123' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      const decodedToken = verifyToken(response.body.token);
      expect(decodedToken).toHaveProperty('id');
      const user = await User.findByPk(decodedToken.id);
      expect(user).toBeTruthy();
      expect(user.email).toBe(decodedToken.email);
      expect(user.full_name).toBe(decodedToken.full_name);
    });
  });
});
