const request = require('supertest');
const app = require('../index');
const { User, SocialMedia } = require('../models');
const { createUser, generateTokenTesting, createSocial } = require('../testing');

const dataSocial = {
  name: 'sosialTestlagi',
  social_media_url: 'https://github.com/nama_pengguna',
};
const updateSocial = {
  name: 'sosialUpdate',
  social_media_url: 'https://facebook.com/nama_pengguna',
};

let token;

// create socials
describe('POST /socials', () => {
  beforeAll(async () => {
    try {
      const user = await createUser();
      token = await generateTokenTesting(user);
    } catch (error) {
      console.error('Error during test setup:', error);
    }
  });
  it('should create Socials success (201)', (done) => {
    request(app)
      .post('/socials')
      .send(dataSocial)
      .set({ Authorization: token })
      .expect(201)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('name');
        expect(res.body).toHaveProperty('name');
        expect(res.body).toHaveProperty('social_media_url');
        expect(res.body).toHaveProperty('UserId');
        done();
      });
  });
  it('should be error no auth (401)', (done) => {
    request(app)
      .post('/socials')
      .send(dataSocial)
      .set({ Authorization: '' })
      .expect(401)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).toBe('Token not provided!');
        done();
      });
  });
  it('should be error no auth (400)', (done) => {
    const testSocials = {
      name: 'sosialTestlagi',
    };
    request(app)
      .post('/socials')
      .send(testSocials)
      .set({ Authorization: token })
      .expect(400)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('code', 400);
        expect(res.body).toHaveProperty('message', 'name and social_media_url required fields.');
        expect(res.body.data).toHaveProperty('name', testSocials.name);
        done();
      });
  });
  afterAll(async () => {
    try {
      await User.destroy({ where: {} });
      await SocialMedia.destroy({ where: {} });
    } catch (error) {
      console.error('Error during test cleanup:', error);
      app.close();
    }
  });
});

// views socials all
describe('GET /socials', () => {
  beforeAll(async () => {
    try {
      const user = await createUser();
      token = await generateTokenTesting(user);
      await createSocial(1, user.id);
      await createSocial(2, user.id);
    } catch (error) {
      console.error('Error during test setup:', error);
    }
  });
  it('should create Socials success (200)', (done) => {
    request(app)
      .get('/socials')
      .set({ Authorization: token })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).toHaveLength(2);
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
        const socials = res.body[0];
        expect(socials).toHaveProperty('id');
        expect(socials).toHaveProperty('name');
        expect(socials).toHaveProperty('social_media_url');
        expect(socials).toHaveProperty('UserId');
        expect(socials.User).toHaveProperty('full_name');
        expect(socials.User).toHaveProperty('email');
        expect(socials.User).toHaveProperty('username');
        expect(socials.User).toHaveProperty('password');
        expect(socials.User).toHaveProperty('profile_image_url');
        expect(socials.User).toHaveProperty('age');
        expect(socials.User).toHaveProperty('phone_number');
        done();
      });
  });
  it('should handle case where there are no Socials and return status 404 with appropriate message', async () => {
    const socialsCount = await SocialMedia.count();
    if (socialsCount > 0) {
      await SocialMedia.destroy({
        where: {},
        truncate: true,
      });
    }
    request(app)
      .get('/socials')
      .set({ Authorization: token })
      .expect(404)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.status).toBe(404);
        expect(res.body).toEqual({
          code: 404,
          message: 'Belum ada data social media.',
        });
        expect(res.body).toHaveProperty('code', 404);
        expect(res.body).toHaveProperty('message', 'Belum ada data social media.');
        expect(socialsCount).toBe(2);
        // done();
      });
  });
  it('should be error no auth (401)', (done) => {
    request(app)
      .get('/socials')
      .set({ Authorization: '' })
      .expect(401)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).toBe('Token not provided!');
        done();
      });
  });
  afterAll(async () => {
    try {
      await User.destroy({ where: {} });
      await SocialMedia.destroy({ where: {} });
    } catch (error) {
      console.error('Error during test cleanup:', error);
    }
  });
});

// views socials by id
describe('GET /socials/:id', () => {
  beforeAll(async () => {
    try {
      const user = await createUser();
      token = await generateTokenTesting(user);
      await createSocial(1, user.id);
      await createSocial(2, user.id);
      await createSocial(3, user.id);
    } catch (error) {
      console.error('Error during test setup:', error);
    }
  });
  it('should view by id Socials success (200)', (done) => {
    request(app)
      .get('/socials/2')
      .set({ Authorization: token })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.id).toBe(2);
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('name');
        expect(res.body).toHaveProperty('name');
        expect(res.body).toHaveProperty('social_media_url');
        expect(res.body).toHaveProperty('UserId');
        done();
      });
    done();
  });
  it('should be error no auth (401)', (done) => {
    request(app)
      .get('/socials/1')
      .set({ Authorization: '' })
      .expect(401)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).toBe('Token not provided!');
        done();
      });
  });
  it('should be error not found (404)', (done) => {
    request(app)
      .get('/socials/10')
      .set({ Authorization: token })
      .expect(404)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.message).toBe('Not Found');
        done();
      });
  });
  it('should handle case where there are no Socials by Id and return status 404 with appropriate message', async () => {
    const socialsCount = await SocialMedia.count();
    await SocialMedia.destroy({
      truncate: true,
    });

    const res = await request(app).get('/socials/1').set({ Authorization: token }).expect(404);

    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      code: 404,
      message: 'Not Found',
    });
    expect(res.body).toHaveProperty('code', 404);
    expect(res.body).toHaveProperty('message', 'Not Found');
  });

  afterAll(async () => {
    try {
      await User.destroy({ where: {} });
      await SocialMedia.destroy({ where: {} });
    } catch (error) {
      console.error('Error during test cleanup:', error);
    }
  });
});

// update socials
describe('PUT /socials/1', () => {
  beforeAll(async () => {
    try {
      const user = await createUser();
      token = await generateTokenTesting(user);
      await createSocial(1, user.id);
      await createSocial(2, user.id);
      await createSocial(3, user.id);
    } catch (error) {
      console.error('Error during test setup:', error);
    }
  });
  it('should update Socials success (200)', (done) => {
    request(app)
      .put('/socials/1')
      .set({ Authorization: token })
      .expect(200)
      .send(updateSocial)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.status).toBe(200);
        expect(res.body[1][0]).toEqual({
          UserId: expect.any(Number),
          createdAt: expect.any(String),
          id: expect.any(Number),
          name: updateSocial.name,
          social_media_url: updateSocial.social_media_url,
          updatedAt: expect.any(String),
        });
        done();
      });
  });
  // token null
  it('should be error no auth (401)', (done) => {
    request(app)
      .put('/socials/1')
      .set({ Authorization: '' })
      .expect(401)
      .send(updateSocial)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).toBe('Token not provided!');
        done();
      });
  });
  it('should be error validasi (400)', (done) => {
    const testSocials = {
      name: 'sosialTestlagi',
    };
    request(app)
      .put('/socials/2')
      .send(testSocials)
      .set({ Authorization: token })
      .expect(400)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('code', 400);
        expect(res.body).toHaveProperty('message', 'name and social_media_url required fields.');
        expect(res.body).toHaveProperty('name', 'required fields not provided!');
      });
    done();
  });
  // date not found
  it('should be error not found (404)', (done) => {
    request(app)
      .put('/socials/10')
      .set({ Authorization: token })
      .expect(404)
      .send(updateSocial)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.status).toBe(404);
        expect(res.body.devMessage).toBe('social with id 10 not found');
        done();
      });
  });
  afterAll(async () => {
    try {
      await User.destroy({ where: {} });
      await SocialMedia.destroy({ where: {} });
    } catch (error) {
      console.error('Error during test cleanup:', error);
    }
  });
});

//delete comments
describe('DELETE /socials/1', () => {
  beforeAll(async () => {
    try {
      const user = await createUser();
      token = await generateTokenTesting(user);
      await createSocial(1, user.id);
      await createSocial(2, user.id);
      await createSocial(3, user.id);
    } catch (error) {
      console.error('Error during test setup:', error);
    }
  });
  it('should delete socials success (200)', (done) => {
    request(app)
      .delete('/socials/1')
      .set({ Authorization: token })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('message', 'Data dengan ID 1 berhasil dihapus.');
        done();
      });
  });
  // token null
  it('should be error no auth (401)', (done) => {
    request(app)
      .delete('/socials/1')
      .set({ Authorization: '' })
      .expect(401)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).toBe('Token not provided!');
        done();
      });
  });
  it('should return 404 when trying to delete a non-existing resource', (done) => {
    const idEx = 9999;
    request(app)
      .delete(`/socials/${idEx}`)
      .set({ Authorization: token })
      .expect(404)
      .send(dataSocial)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.status).toBe(404);
        expect(res.body).toHaveProperty('devMessage', `social with id ${idEx} not found`);
        expect(res.body).toHaveProperty('name', 'Data not found');
        done();
      });
  });
  afterAll(async () => {
    try {
      await User.destroy({ where: {} });
      await SocialMedia.destroy({ where: {} });
    } catch (error) {
      console.error('Error during test cleanup:', error);
    }
  });
});
