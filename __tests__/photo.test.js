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
  });

  beforeEach(async () => {
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
    await User.destroy({ where: { email: user.email } });
  });

  describe('POST /photos', () => {
    it('should create a new photo and return status 201 with the created photo data', async () => {
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

    it('should handle validation errors and return status 400 with an error message', async () => {
      const invalidPhotoData = {
        caption: 'Invalid Photo',
        poster_image_url: 'https://example.com/invalid-photo.jpg',
      };

      // Send the request with invalid data
      const response = await request(server)
        .post('/photos')
        .set('token', token)
        .send(invalidPhotoData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('code', 400);
      expect(response.body).toHaveProperty(
        'message',
        'Title, caption, and poster_image_url are required fields.'
      );
      expect(response.body.data).toHaveProperty('caption', invalidPhotoData.caption);
      expect(response.body.data).toHaveProperty(
        'poster_image_url',
        invalidPhotoData.poster_image_url
      );
    });

    it('should handle Validation isUrl on poster_image_url and return an error message', async () => {
      const newPhotoData = {
        title: 'New Photo',
        caption: 'A beautiful new photo',
        poster_image_url: 'invalidurl',
      };
      const response = await request(server).post('/photos').set('token', token).send(newPhotoData);
      expect(response.status).toBe(400);
      expect(response.body.errors).toHaveLength(1);
      expect(response.body).toHaveProperty('message', 'Validation error.');
      expect(response.body.errors[0].message).toBe('Validation isUrl on poster_image_url failed');
      expect(response.body.errors[0].path).toBe('poster_image_url');
    });
  });

  describe('GET /photos', () => {
    it('should handle case where there are no photos and return status 404 with appropriate message', async () => {
      const response = await request(server).get('/photos').set('token', token);
      // console.log(response.body);
      // expect(response.status).toBe(404);
      // expect(response.body).toEqual({ message: 'Belum ada data photo.' });
    });
    it('should get all photos data and return the all photo datas', async () => {
      const newPhotoData = {
        title: 'New Photo',
        caption: 'A beautiful new photo',
        poster_image_url: 'https://example.com/new-photo.jpg',
      };
      await request(server).post('/photos').set('token', token).send(newPhotoData);

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
      expect(photo.User).toHaveProperty('id');
      expect(photo.User).toHaveProperty('full_name');
      expect(photo.User).toHaveProperty('email');
      expect(photo.User).toHaveProperty('username');
      expect(photo.User).toHaveProperty('password');
      expect(photo.User).toHaveProperty('profile_image_url');
      expect(photo.User).toHaveProperty('age');
      expect(photo.User).toHaveProperty('phone_number');
      expect(photo.User).toHaveProperty('createdAt');
      expect(photo.User).toHaveProperty('updatedAt');
    });
  });

  describe('DELETE /photos/:id', () => {
    it('should delete a photo by ID and return status 200 with a success message', async () => {
      const newPhotoData = {
        title: 'New Photo',
        caption: 'A beautiful new photo',
        poster_image_url: 'https://example.com/new-photo.jpg',
      };
      const photoData = await request(server)
        .post('/photos')
        .set('token', token)
        .send(newPhotoData);

      const response = await request(app)
        .delete(`/photos/${photoData.body.id}`)
        .set('token', token);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty(
        'message',
        `Data dengan ID ${photoData.body.id} berhasil dihapus.`
      );
    });

    it('should handle case where photo with given ID is not found and return status 404 with an error message', async () => {
      const response = await request(app).delete('/photos/999999').set('token', token);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('name', 'Data not found');
      expect(response.body).toHaveProperty('devMessage', 'Photo with id 999999 not found');
    });
  });
});
