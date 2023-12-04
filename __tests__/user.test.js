const request = require('supertest');
const app = require('../index');
const { User } = require('../models');

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
      const response2 = await request(app).post('/users/register').send(user);
      expect(response2.status).toBe(404);
      expect(response2.body).toHaveProperty('code', 404);
      expect(response2.body).toHaveProperty(
        'message',
        'user already registered!'
      );
    });
  });

  //   describe('POST /users/login', () => {
  //     it('should log in a user and return a token', async () => {
  //       const credentials = {
  //         email: 'john@example.com',
  //         password: 'password123',
  //       };

  //       const response = await request(app)
  //         .post('/users/login')
  //         .send(credentials);

  //       expect(response.status).toBe(200);
  //       expect(response.body).toHaveProperty('token');
  //       // Add more assertions based on your expected response

  //       // Verify the token is valid (decode and check user details)
  //       const decodedToken = decodeToken(response.body.token);
  //       const user = await User.findByPk(decodedToken.id);
  //       expect(user).toBeTruthy();
  //       expect(user.email).toBe(credentials.email);
  //     });

  //     it('should handle login errors and return a 500 status code', async () => {
  //       // Mock the User.findOne method to throw an error
  //       jest.spyOn(User, 'findOne').mockImplementationOnce(() => {
  //         throw new Error('Mocked error during login');
  //       });

  //       const credentials = {
  //         email: 'invalid@example.com',
  //         password: 'invalidpassword',
  //       };

  //       const response = await request(app)
  //         .post('/users/login')
  //         .send(credentials);

  //       expect(response.status).toBe(500);
  //       // Add more assertions based on your expected error response
  //     });

  //     it('should handle incorrect password and return a 401 status code', async () => {
  //       const credentials = {
  //         email: 'john@example.com',
  //         password: 'incorrectpassword',
  //       };

  //       const response = await request(app)
  //         .post('/users/login')
  //         .send(credentials);

  //       expect(response.status).toBe(401);
  //       // Add more assertions based on your expected error response
  //     });
});
