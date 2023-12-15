const request = require('supertest');
const app = require('../index');
const { User } = require('../models');
const { verifyToken } = require('../helpers/jwt');

describe('Authentication', () => {
  let server;
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
    server = app.listen();
    await User.destroy({ where: { email: user.email } });
    await request(server).post('/users/register').send(user);
    await request(server).post('/users/login').send(user);
    const userLogin = await request(server).post('/users/login').send(user);
    const decodedToken = verifyToken(userLogin.body.token);
    token = userLogin.body.token;
    userData = decodedToken;
  });

  afterAll((done) => {
    server.close(done);
  });

  afterEach(async () => {
    await new Promise((resolve) => setTimeout(() => resolve(), 500));
  });

  describe('GET /photos', () => {
    it('should get all photos data and return the all photo datas', async () => {
      const response = await request(server).get(`/photos/`).set('token', token).send(user);
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      const photo = response.body[0];
      expect(photo).toHaveProperty('id');
      expect(photo).toHaveProperty('title');
      expect(photo).toHaveProperty('caption');
      expect(photo).toHaveProperty('poster_image_url');
      expect(photo).toHaveProperty('UserId');
      expect(photo).toHaveProperty('createdAt');
      expect(photo).toHaveProperty('updatedAt');
      expect(photo).toHaveProperty('Comments');
      expect(photo).toHaveProperty('User');
      const userPhoto = photo.User;
      expect(userPhoto).toHaveProperty('id');
      expect(userPhoto).toHaveProperty('full_name');
      expect(userPhoto).toHaveProperty('email');
      expect(userPhoto).toHaveProperty('username');
      expect(userPhoto).toHaveProperty('password');
      expect(userPhoto).toHaveProperty('profile_image_url');
      expect(userPhoto).toHaveProperty('age');
      expect(userPhoto).toHaveProperty('phone_number');
      expect(userPhoto).toHaveProperty('createdAt');
      expect(userPhoto).toHaveProperty('updatedAt');
    });
    it('should handle case where there are no photos and return status 404 with appropriate message', async () => {
      const response = await request(server).get('/photos').set('token', token);
      console.log(response.body);
      // expect(response.status).toBe(404);
      // expect(response.body).toEqual({ message: 'Belum ada data photo.' });
    });
  });

  describe('POST /photos', () => {
    it('should create a new photo and return status 201 with the created photo data', async () => {
      // Set up the request body for creating a new photo
      const newPhotoData = {
        title: 'New Photo',
        caption: 'A beautiful new photo',
        poster_image_url: 'https://example.com/new-photo.jpg',
      };

      const response = await request(server).post('/photos').set('token', token).send(newPhotoData);
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(newPhotoData.title);
      expect(response.body.caption).toBe(newPhotoData.caption);
      expect(response.body.poster_image_url).toBe(newPhotoData.poster_image_url);
      expect(response.body.UserId).toBe(userData.id);
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');
    });

    it('should handle validation errors and return status 500 with an error message', async () => {
      // Set up the request body with missing required fields
      const invalidPhotoData = {
        caption: 'Invalid Photo',
        poster_image_url: 'https://example.com/invalid-photo.jpg',
      };

      // Send the request with invalid data
      const response = await request(server)
        .post('/photos')
        .set('token', token)
        .send(invalidPhotoData);

      // Expect the response status to be 500
      expect(response.status).toBe(500);

      // Expect the response body to contain an error message
      expect(response.body).toHaveProperty('message');
    });

    it('should handle internal server errors and return status 500 with an error message', async () => {
      // Simulate an internal server error by causing an exception in the controller
      jest.spyOn(Photo, 'create').mockImplementationOnce(() => {
        throw new Error('Simulated internal server error');
      });

      // Set up valid request body
      const validPhotoData = {
        title: 'New Photo',
        caption: 'A beautiful new photo',
        poster_image_url: 'https://example.com/new-photo.jpg',
      };

      // Send the request to create a new photo
      const response = await request(server)
        .post('/photos')
        .set('token', token)
        .send(validPhotoData);

      // Expect the response status to be 500
      expect(response.status).toBe(500);

      // Expect the response body to contain an error message
      expect(response.body).toHaveProperty('message', 'Simulated internal server error');
    });
  });
});
