const request = require('supertest');
const app = require('../index');
const { User } = require('../models');
const { verifyToken } = require('../helpers/jwt');

describe('Authentication', () => {
  let server;
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
    server = app.listen();
  });

  afterAll((done) => {
    server.close(done);
  });

  afterEach(async () => {
    await new Promise((resolve) => setTimeout(() => resolve(), 500));
  });

  describe('POST /users/register', () => {
    it('should register a new user and return user data', async () => {
      const response = await request(server).post('/users/register').send(user);
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('full_name', user.full_name);
      expect(response.body).toHaveProperty('email', user.email);
      expect(response.body).toHaveProperty('profile_image_url', user.profile_image_url);
      expect(response.body).toHaveProperty('age', user.age);
      expect(response.body).toHaveProperty('phone_number', user.phone_number);
    });

    it('should return an error when the email is already registered', async () => {
      const response = await request(server).post('/users/register').send(user);
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('code', 404);
      expect(response.body).toHaveProperty('message', 'user already registered!');
      expect(response.body).not.toHaveProperty('email', expect.anything());
      expect(response.body).not.toHaveProperty('password', expect.anything());
    });
  });

  describe('POST /users/login', () => {
    it('should log in a user and return a token', async () => {
      const response = await request(server).post('/users/login').send(user);
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
      // invalid password
      const invalidPassword = 'incorrectpassword';

      const response = await request(server)
        .post('/users/login')
        .send({ email: user.email, password: invalidPassword });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        code: 401,
        message: 'Incorrect password!',
      });

      // cari dan ambil data dari database berdasarkan email
      const UserData = await User.findOne({
        where: {
          email: user.email,
        },
      });

      // check apakah benar password user berbeda
      expect(UserData.password).not.toEqual(invalidPassword);

      // chek apakah benar user yang sama
      expect(UserData.email).toEqual(user.email);
      expect(UserData.username).toEqual(user.username);
    });

    it('should return 400 for missing email in request', async () => {
      const incorrectEmail = 'incorrect email';

      const response = await request(server)
        .post('/users/login')
        .send({ email: incorrectEmail, password: 'password123' });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('code', 404);
      expect(response.body).toHaveProperty('message', 'user not registered!');
      expect(response.body).toEqual({
        code: 404,
        message: 'user not registered!',
      });

      // cari dan ambil data dari database berdasarkan email
      const UserData = await User.findOne({
        where: {
          email: incorrectEmail,
        },
      });

      // Pastikan UserData adalah null, menandakan bahwa
      // pengguna dengan email tersebut tidak ditemukan
      expect(UserData).toBeNull();
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
      await request(server).post('/users/register').send(user);
      const response = await request(server).post('/users/login').send(user);
      const decodedToken = verifyToken(response.body.token);
      token = response.body.token;
      userData = decodedToken;
    });

    it('should update user data and return the updated user details', async () => {
      const response = await request(server)
        .put(`/users/${userData.id}`)
        .set('token', token)
        .send(updatedUserData);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('full_name', updatedUserData.full_name);
      expect(response.body).toHaveProperty('email', updatedUserData.email);
      expect(response.body).toHaveProperty('username', updatedUserData.username);
      expect(response.body).toHaveProperty('profile_image_url', updatedUserData.profile_image_url);
      expect(response.body).toHaveProperty('age', updatedUserData.age);
      expect(response.body).toHaveProperty('phone_number', updatedUserData.phone_number);
    });

    it('should fail to update user data when ID parameter is missing or not a number', async () => {
      const invalidId = 'invalidId';
      const response = await request(server)
        .put(`/users/${invalidId}`)
        .set('token', token)
        .send(updatedUserData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('code', 400);
      expect(response.body).toHaveProperty(
        'message',
        'Bad Request: ID parameter is missing or not a number.'
      );
      expect(response.body).toEqual({
        code: 400,
        message: 'Bad Request: ID parameter is missing or not a number.',
      });

      // cari di database apakah data terupdate
      // cari dan ambil data dari database berdasarkan email
      const UserData = await User.findOne({
        where: {
          email: updatedUserData.email,
        },
      });

      // memastikan tidak ada data dengan email dari updateduser
      expect(UserData).toBeNull();
    });

    it('should fail to update user data when user id in params is invalid or not found', async () => {
      const invalidUserId = userData.id + 1;
      const response = await request(server)
        .put(`/users/${invalidUserId}`)
        .set('token', token)
        .send(user);
      const decodedToken = verifyToken(token);
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('name', 'Data not found');
      expect(response.body).toHaveProperty(
        'message',
        `user with id ${decodedToken.id + 1} not found`
      );

      // mencari data user dengan id
      const UserData = await User.findByPk(invalidUserId);
      // memastikdan bahwa invalid user id benar-benar tidak ada di dalam database
      expect(UserData).toBeNull();

      // memastidkan bahwa id di token dengan id user di params berbeda
      expect(userData.id).not.toEqual(invalidUserId);
    });
  });

  describe('Delete /users/:id', () => {
    let token = '';
    let userData;
    beforeEach(async () => {
      await User.destroy({ where: { email: user.email } });
      await request(server).post('/users/register').send(user);
      await request(server).post('/users/login').send(user);
      const userLogin = await request(server).post('/users/login').send(user);
      const decodedToken = verifyToken(userLogin.body.token);
      token = userLogin.body.token;
      userData = decodedToken;
    });

    it('should delete user data and return the success message', async () => {
      // mencari data di database
      let UserData = await User.findByPk(userData.id);

      // memastikan bahwa ada data dengan id yang akan di delete
      expect(UserData).toBeTruthy();
      expect(UserData).toHaveProperty('email');
      expect(UserData).toHaveProperty('password');

      const response = await request(server)
        .delete(`/users/${userData.id}`)
        .set('token', token)
        .send(user);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Your account has been deleted successfully');

      // mencari data di database
      UserData = await User.findByPk(userData.id);

      // memastikan bahwa tidak ada data dengan id yang sudah di delete
      expect(UserData).toBeNull();
    });

    it('should fail to delete user data when ID parameter is missing or not a number', async () => {
      const invalidId = 'invalidId';

      const response = await request(server)
        .delete(`/users/${invalidId}`)
        .set('token', token)
        .send(user);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('code', 400);
      expect(response.body).toHaveProperty(
        'message',
        'Bad Request: ID parameter is missing or not a number.'
      );

      // mencari data di database
      UserData = await User.findByPk(userData.id);

      // memastikan bahwa id terkait tidak terdelete
      expect(UserData).toBeTruthy();
      expect(UserData).toHaveProperty('email');
      expect(UserData).toHaveProperty('password');
    });

    it('should fail to delete user data when user id in params is unauthorized or not found', async () => {
      // register user
      await request(server).post('/users/register').send(user);
      // login user
      const responseUser = await request(server).post('/users/login').send(user);
      // decode the token
      const decodedToken = verifyToken(responseUser.body.token);
      const token = responseUser.body.token;
      const userData = decodedToken;

      const invalidUserId = userData.id + 1;
      const response = await request(server)
        .delete(`/users/${invalidUserId}`)
        .set('token', token)
        .send(user);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('name', 'Data not found');
      expect(response.body).toHaveProperty('message', `user with id ${invalidUserId} not found`);

      // mencari data user dengan id
      const UserData = await User.findByPk(userData.id);

      // memastikdan bahwa invalid user id masih ada di dalam database
      expect(UserData).toBeTruthy();

      // memastidkan bahwa id di token dengan id user di params berbeda
      expect(userData.id).not.toEqual(invalidUserId);
    });
  });
});
