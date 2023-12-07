const request = require('supertest');
const app = require('../index');
const { User } = require('../models');
const { verifyToken } = require('../helpers/jwt');
const { hashPassword } = require('../helpers/bcrypt');

describe('Authentication', () => {
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
      expect(response.body).not.toHaveProperty('email', expect.anything());
      expect(response.body).not.toHaveProperty('password', expect.anything());
    });
  });

  describe('POST /users/login', () => {
    it('should log in a user and return a token', async () => {
      const response = await request(app).post('/users/login').send(user);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      const decodedToken = verifyToken(response.body.token);
      expect(decodedToken).toHaveProperty('id');
      const userData = await User.findByPk(decodedToken.id);
      expect(userData).toBeTruthy();
      expect(userData.email).toBe(decodedToken.email);
      expect(userData.full_name).toBe(decodedToken.full_name);
    });
    it('should return 401 for incorrect password', async () => {
      const response = await request(app)
        .post('/users/login')
        .send({ email: user.email, password: 'incorrectpassword' });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        code: 401,
        message: 'Incorrect password!',
      });
    });
    it('should return 400 for missing email in request', async () => {
      const response = await request(app)
        .post('/users/login')
        .send({ email: 'incorrect email', password: 'password123' });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        code: 404,
        message: 'user not registered!',
      });
    });
  });

  describe('PUT /users/:id', () => {
    const updatedUserData = {
      full_name: 'John Doe update',
      email: 'johnupdate@gmail.com',
      username: 'johndoe update',
      password: 'password123',
      profile_image_url:
        'https://plus.unsplash.com/premium_photo-1700782893131-1f17b56098d0?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxlZGl0b3JpYWwtZmVlZHwyfHx8ZW58MHx8fHx8',
      age: 12,
      phone_number: '123456789',
    };
    let token = '';
    let userData;
    beforeEach(async () => {
      await User.destroy({ where: { email: updatedUserData.email } });
      await User.destroy({ where: { email: user.email } });
      await request(app).post('/users/register').send(user);
      const response = await request(app).post('/users/login').send(user);
      const decodedToken = verifyToken(response.body.token);
      token = response.body.token;
      userData = decodedToken;
    });
    it('should update user data and return the updated user details', async () => {
      const response = await request(app)
        .put(`/users/${userData.id}`)
        .set('token', token)
        .send(updatedUserData);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty(
        'full_name',
        updatedUserData.full_name
      );
      expect(response.body).toHaveProperty('email', updatedUserData.email);
    });

    it('should fail to update user data when ID parameter is missing or not a number', async () => {
      const invalidId = 'invalidId';
      const response = await request(app)
        .put(`/users/${invalidId}`)
        .set('token', token)
        .send(user);
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('code', 400);
      expect(response.body).toHaveProperty(
        'message',
        'Bad Request: ID parameter is missing or not a number.'
      );
    });

    it('should fail to update user data when user is not allowed to update', async () => {
      const otherUserId = userData.id + 1;
      const response = await request(app)
        .put(`/users/${otherUserId}`)
        .set('token', token)
        .send(user);
      const decodedToken = verifyToken(token);
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('name', 'Data not found');
      expect(response.body).toHaveProperty(
        'message',
        `user with id ${decodedToken.id + 1} not found`
      );
    });
  });

  describe('Delete /users/:id', () => {
    let token = '';
    let userData;
    beforeEach(async () => {
      await User.destroy({ where: { email: user.email } });
      await request(app).post('/users/register').send(user);
      await request(app).post('/users/login').send(user);
      const userLogin = await request(app).post('/users/login').send(user);
      const decodedToken = verifyToken(userLogin.body.token);
      token = userLogin.body.token;
      userData = decodedToken;
    });
    it('should delete user data and return the success message', async () => {
      const response = await request(app)
        .delete(`/users/${userData.id}`)
        .set('token', token)
        .send(user);
      console.log(response.body);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty(
        'message',
        'Your account has been deleted successfully'
      );
    });
    it('should fail to delete user data when ID parameter is missing or not a number', async () => {
      const invalidId = 'invalidId';

      const response = await request(app)
        .delete(`/users/${invalidId}`)
        .set('token', token)
        .send(user);
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('code', 400);
      expect(response.body).toHaveProperty(
        'message',
        'Bad Request: ID parameter is missing or not a number.'
      );
    });
  });
});
