const request = require('supertest');
const app = require('../index');
const { User, Photo } = require('../models');
const { verifyToken } = require('../helpers/jwt');

describe('Photo test', () => {
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
      const photosCount = await Photo.count();

      if (photosCount > 0) {
        await Photo.destroy({
          where: {},
          truncate: true,
        });
      }

      const response = await request(server).get('/photos').set('token', token);
      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        code: 404,
        message: 'Belum ada data photo.',
      });
      expect(response.body).toHaveProperty('code', 404);
      expect(response.body).toHaveProperty('message', 'Belum ada data photo.');
      expect(photosCount).toBe(0);
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

  describe('PUT /photos/:id', () => {
    let id;
    it('should update a photo and return status 200 with the updated photo data', async () => {
      const newPhotoData = {
        title: 'New Photo',
        caption: 'A beautiful new photo',
        poster_image_url: 'https://example.com/new-photo.jpg',
      };
      const createResponse = await request(server)
        .post('/photos')
        .set('token', token)
        .send(newPhotoData);

      // Update the created photo
      const updatedPhotoData = {
        title: 'Updated Photo',
        caption: 'An updated beautiful photo',
        poster_image_url: 'https://example.com/updated-photo.jpg',
      };
      const updateResponse = await request(server)
        .put(`/photos/${createResponse.body.id}`)
        .set('token', token)
        .send(updatedPhotoData);

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body[1][0]).toHaveProperty('id', createResponse.body.id);
      expect(updateResponse.body[1][0].title).toBe(updatedPhotoData.title);
      expect(updateResponse.body[1][0].caption).toBe(updatedPhotoData.caption);
      expect(updateResponse.body[1][0].poster_image_url).toBe(updatedPhotoData.poster_image_url);
      expect(updateResponse.body[1][0].UserId).toBe(userData.id);
      expect(updateResponse.body[1][0]).toHaveProperty('createdAt');
      expect(updateResponse.body[1][0]).toHaveProperty('updatedAt');
    });

    it('should handle validation errors and return status 400 with an error message', async () => {
      const newPhotoData = {
        title: 'New Photo',
        caption: 'A beautiful new photo',
        poster_image_url: 'https://example.com/new-photo.jpg',
      };

      const createResponse = await request(server)
        .post('/photos')
        .set('token', token)
        .send(newPhotoData);

      const invalidPhotoData = {
        caption: 'Invalid Photo',
        poster_image_url: 'https://example.com/invalid-photo.jpg',
      };

      // Send the request with invalid data
      const response = await request(server)
        .put(`/photos/${createResponse.body.id}`)
        .set('token', token)
        .send(invalidPhotoData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('code', 400);
      expect(response.body).toHaveProperty('name', 'required fields not provided!');
      expect(response.body).toHaveProperty(
        'message',
        `Title, caption, and poster_image_url are required fields.`
      );
      expect(response.body).toEqual({
        code: 400,
        name: 'required fields not provided!',
        message: 'Title, caption, and poster_image_url are required fields.',
      });
    });

    it('should handle case where the photo ID does not exist and return status 404 with appropriate message', async () => {
      const nonExistentId = 9999;
      const updatedPhotoData = {
        title: 'Updated Photo',
        caption: 'An updated beautiful photo',
        poster_image_url: 'https://example.com/updated-photo.jpg',
      };

      const response = await request(server)
        .put(`/photos/${nonExistentId}`)
        .set('token', token)
        .send(updatedPhotoData);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('code', 404);
      expect(response.body).toHaveProperty('name', 'Data not found');
      expect(response.body).toHaveProperty(
        'devMessage',
        `Photo with id ${nonExistentId} not found`
      );
      expect(response.body).toEqual({
        code: 404,
        devMessage: `Photo with id ${nonExistentId} not found`,
        name: 'Data not found',
      });
    });

    it('should handle url validation and return status 400 with an error message', async () => {
      const newPhotoData = {
        title: 'New Photo',
        caption: 'A beautiful new photo',
        poster_image_url: 'https://example.com/new-photo.jpg',
      };
      const createResponse = await request(server)
        .post('/photos')
        .set('token', token)
        .send(newPhotoData);

      const updatedPhotoData = {
        title: 'Updated Photo',
        caption: 'An updated beautiful photo',
        poster_image_url: 'invalid url',
      };
      const updateResponse = await request(server)
        .put(`/photos/${createResponse.body.id}`)
        .set('token', token)
        .send(updatedPhotoData);

      expect(updateResponse.body).toHaveProperty(
        'message',
        `Validation error: Validation isUrl on poster_image_url failed`
      );
      expect(updateResponse.body).toEqual({
        message: 'Validation error: Validation isUrl on poster_image_url failed',
      });
      const photodata = await Photo.findByPk(createResponse.body.id);

      // cek data photo di database
      expect(photodata.title).not.toEqual(updatedPhotoData.title);
      expect(photodata.caption).not.toEqual(updatedPhotoData.caption);
      expect(photodata.poster_image_url).not.toEqual(updatedPhotoData.poster_image_url);
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

      // cek data photo di database terlebih dahulu
      const photoDataFromDatabase = await Photo.findByPk(photoData.body.id);

      expect(photoDataFromDatabase).toHaveProperty('id', photoData.body.id);
      expect(photoDataFromDatabase).toHaveProperty('title', photoData.body.title);
      expect(photoDataFromDatabase).toHaveProperty('caption', photoData.body.caption);
      expect(photoDataFromDatabase).toHaveProperty(
        'poster_image_url',
        photoData.body.poster_image_url
      );

      const response = await request(app)
        .delete(`/photos/${photoData.body.id}`)
        .set('token', token);

      const photoDataFromDatabase2 = await Photo.findByPk(photoData.body.id);
      expect(response.status).toBe(200);
      expect(photoDataFromDatabase2).toBe(null);
      expect(response.body).toHaveProperty(
        'message',
        `Data dengan ID ${photoData.body.id} berhasil dihapus.`
      );
    });

    it('should return 401 or 403 when deleting without authorization', async () => {
      // other user initiate
      const otherUser = {
        full_name: 'liu kang',
        email: 'liukang@gmail.com',
        username: 'liukang',
        password: 'password123',
        profile_image_url:
          'https://plus.unsplash.com/premium_photo-1700782893131-1f17b56098d0?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxlZGl0b3JpYWwtZmVlZHwyfHx8ZW58MHx8fHx8',
        age: 34,
        phone_number: '123456789',
      };

      await request(server).post('/users/register').send(otherUser);
      const otherUserLogin = await request(server).post('/users/login').send(otherUser);
      const otherUserToken = otherUserLogin.body.token;

      //user post new photo
      const newPhotoData = {
        title: 'New Photo',
        caption: 'A beautiful new photo',
        poster_image_url: 'https://example.com/new-photo.jpg',
      };
      const createPhotoResponse = await request(server)
        .post('/photos')
        .set('token', token) // create with user token
        .send(newPhotoData);

      // try to delete ur photo using other user token
      const response = await request(app)
        .delete(`/photos/${createPhotoResponse.body.id}`)
        .set('token', otherUserToken);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('code', 403);
      expect(response.body).toHaveProperty('name', 'Authorization failed');
      expect(response.body).toHaveProperty(
        'devMessage',
        'User with id undefined does not have permission to access the photo'
      );

      // cek di database apakah data masih ada
      const photoDataFromDatabase = await Photo.findByPk(createPhotoResponse.body.id);
      expect(photoDataFromDatabase).toHaveProperty('title', createPhotoResponse.body.title);
      expect(photoDataFromDatabase).toHaveProperty('caption', createPhotoResponse.body.caption);
      expect(photoDataFromDatabase).toHaveProperty(
        'poster_image_url',
        createPhotoResponse.body.poster_image_url
      );
    });

    it('should return 404 when trying to delete a non-existing resource', async () => {
      const invalidId = 9999;
      const response = await request(app).delete(`/photos/${invalidId}`).set('token', token);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('code', 404);
      expect(response.body).toHaveProperty('name', 'Data not found');
      expect(response.body).toHaveProperty('devMessage', `Photo with id ${invalidId} not found`);
      expect(response.body).toEqual({
        code: 404,
        devMessage: `Photo with id ${invalidId} not found`,
        name: 'Data not found',
      });
    });

    it('should return 500 when trying to access the delete endpoint with invalid token', async () => {
      //user post new photo
      const newPhotoData = {
        title: 'New Photo',
        caption: 'A beautiful new photo',
        poster_image_url: 'https://example.com/new-photo.jpg',
      };

      const createPhotoResponse = await request(server)
        .post('/photos')
        .set('token', token)
        .send(newPhotoData);

      token = token + 'invalid';

      // try to delete photo
      const response = await request(app)
        .delete(`/photos/${createPhotoResponse.body.id}`)
        .set('token', token);

      expect(response.status).toBe(500);
      expect(response.body).toEqual('invalid signature');

      // cek di database apakah data masih ada
      const photoDataFromDatabase = await Photo.findByPk(createPhotoResponse.body.id);
      expect(photoDataFromDatabase).toHaveProperty('title', createPhotoResponse.body.title);
      expect(photoDataFromDatabase).toHaveProperty('caption', createPhotoResponse.body.caption);
      expect(photoDataFromDatabase).toHaveProperty(
        'poster_image_url',
        createPhotoResponse.body.poster_image_url
      );
    });
  });
});
