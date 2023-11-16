const request = require('supertest');
const app = require('../index');
const { user, photo } = require('../models');

const dataUser = {
  full_name: 'Arihendra',
  email: 'arihendra@mail.com',
  username: 'arihendra',
  password: 'password',
  profile_image_url: 'https://example.com/john.jpg',
  age: '90',
  phone_number: '123',
};

let authToken; // To store the authentication token

describe('Test Cases for API create photo', () => {
  beforeAll(async () => {
    try {
      // Create a user and generate an authentication token
      const userResponse = await request(app)
        .post('/users/register')
        .send(dataUser);
      console.log(userResponse.body);
      const loginResponse = await request(app).post('/users/login').send({
        email: dataUser.email,
        password: dataUser.password,
      });

      authToken = loginResponse.body.token;
    } catch (error) {
      console.error(error);
    }
  });

  afterAll(async () => {
    try {
      // Destroy the user and related data
      await user.destroy({ where: {} });
      await photo.destroy({ where: {} });
    } catch (error) {
      console.error(error);
    }
  });

  it('Should return a success response', (done) => {
    // Make a request to create a photo with the authToken
    console.log(authToken);
    request(app)
      .post('/photos')
      .set('token', authToken) // Use "token" header for authentication
      .expect(201)
      .end((err, res) => {
        if (err) return done(err);
        done();
      });
  });
});
