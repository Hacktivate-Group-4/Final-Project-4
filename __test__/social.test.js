const request = require("supertest");
const app = require("../index");
const { User, SocialMedia } = require("../models");
const { createUser, generateTokenTesting,  createSocial } = require("./testing");

const dataSocial = {
  name:"sosialTestlagi", 
  social_media_url:"https://github.com/nama_pengguna"
};
const updateSocial = {
  name:"sosialUpdate", 
  social_media_url:"https://facebook.com/nama_pengguna"
};

let token;

// create socials
describe("POST /socials", () => {
  beforeAll(async () => {
    try {
      const user = await createUser();
      token = await generateTokenTesting(user);
    } catch (error) {
      console.error("Error during test setup:", error);
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
        expect(res.body).toHaveProperty("id");
        expect(res.body).toHaveProperty("name");
        expect(res.body).toHaveProperty("name");
        expect(res.body).toHaveProperty("social_media_url");
        expect(res.body).toHaveProperty("UserId");
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
  afterAll(async () => {
    try {
      await User.destroy({ where: {} });
      await SocialMedia.destroy({ where: {} });
    } catch (error) {
      console.error("Error during test cleanup:", error);
      app.close();
    }
  });
});


// views socials all
describe("GET /socials", () => {
  beforeAll(async () => {
    try {
      const user = await createUser();
      token = await generateTokenTesting(user);
      await createSocial(1, user.id);
      await createSocial(2, user.id);
    } catch (error) {
      console.error("Error during test setup:", error);
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
        expect(res.body[0]).toHaveProperty("id");
        expect(res.body[0]).toHaveProperty("name");
        expect(res.body[0]).toHaveProperty("name");
        expect(res.body[0]).toHaveProperty("social_media_url");
        expect(res.body[0]).toHaveProperty("UserId");
        done();
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
      console.error("Error during test cleanup:", error);
    }
  });
});


// views socials by id
describe("GET /socials/:id", () => {
  beforeAll(async () => {
    try {
      const user = await createUser();
      token = await generateTokenTesting(user);
      await createSocial(1, user.id);
      await createSocial(2, user.id);
      await createSocial(3, user.id);
    } catch (error) {
      console.error("Error during test setup:", error);
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
        expect(res.body).toHaveProperty("id");
        expect(res.body).toHaveProperty("name");
        expect(res.body).toHaveProperty("name");
        expect(res.body).toHaveProperty("social_media_url");
        expect(res.body).toHaveProperty("UserId");
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
  afterAll(async () => {
    try {
      await User.destroy({ where: {} });
      await SocialMedia.destroy({ where: {} });
    } catch (error) {
      console.error("Error during test cleanup:", error);
    }
  });
});


// update socials
describe("PUT /socials/1", () => {
  beforeAll(async () => {
    try {
      const user = await createUser();
      token = await generateTokenTesting(user);
      await createSocial(1, user.id);
    } catch (error) {
      console.error("Error during test setup:", error);
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
        expect(res.body[1][0]).toHaveProperty("name", updateSocial.name);
        expect(res.body[1][0]).toHaveProperty("social_media_url", updateSocial.social_media_url);
        expect(res.body[1][0]).toHaveProperty("UserId");
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
  // date not found
  it('should be error not found (404)', (done) => {
    request(app)
      .put('/socials/10')
      .set({ Authorization: token }) 
      .expect(404)
      .send(updateSocial)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.devMessage).toBe('social with id 10 not found');
        done();
      });
  });
  
  afterAll(async () => {
    try {
      await User.destroy({ where: {} });
      await SocialMedia.destroy({ where: {} });
    } catch (error) {
      console.error("Error during test cleanup:", error);
    }
  });
});

//delete comments
describe("DELETE /socials/1", () => {
  beforeAll(async () => {
    try {
      const user = await createUser();
      token = await generateTokenTesting(user);
      await createSocial(1, user.id);
      await createSocial(2, user.id);
      await createSocial(3, user.id);
    } catch (error) {
      console.error("Error during test setup:", error);
    }
  });
  it('should delete socials success (200)', (done) => {
    request(app)
      .delete('/socials/1')
      .set({ Authorization: token }) 
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        // expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("message", 'Data dengan ID 1 berhasil dihapus.');
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
  // it('should be error no auth (404)', (done) => {
  //   request(app)
  //     .delete('/socials/10')
  //     .set({ Authorization: token }) 
  //     .expect(404)
  //     .end((err, res) => {
  //       if (err) return done(err);
  //       expect(res.status).toBe(404);
  //       // expect(res.body).toHaveProperty('Data not found');
  //       expect(res.body && res.body.message).toBe('Data dengan ID 10 tidak ditemukan.');
  //       done();
  //     });
  // }, 10000);
  // it('should be error internal server error (500)', (done) => {
  //   request(app)
  //     .delete('/socials/1')
  //     .set({ Authorization: token }) 
  //     .end((err, res) => {
  //       if (err) return done(err);
  //       // expect(res.status).toBe(500);
  //       expect(res.body.message).toBe('Internal Server Error');
  //       done();
  //     });
  // });
  afterAll(async () => {
    try {
      await User.destroy({ where: {} });
      await SocialMedia.destroy({ where: {} });
    } catch (error) {
      console.error("Error during test cleanup:", error);
    }
  });
});
