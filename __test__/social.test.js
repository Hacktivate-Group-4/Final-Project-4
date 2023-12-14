const request = require("supertest");
const app = require("../index");
const { User, SocialMedia } = require("../models");
const { createUser, generateTokenTesting,  createSocial } = require("./testing");

const dataSocial = {
  name:"sosialTestlagi", 
  social_media_url:"https://github.com/nama_pengguna"
};

let token;

describe("POST /socials", () => {
  beforeAll(async () => {
    try {
      const user = await createUser();
      token = await generateTokenTesting(user);
    } catch (error) {
      console.error("Error during test setup:", error);
    }
  });
  it('should create Comments success (201)', (done) => {
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
  it('should create Comments success (200)', (done) => {
    request(app)
      .get('/socials')
      .set({ Authorization: token }) 
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).toHaveLength(2);
        expect(res.body[0]).toHaveProperty("id ");
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
  it('should create Comments success (200)', (done) => {
    request(app)
      .get('/socials/2')
      .set({ Authorization: token }) 
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.id).toBe(2);
        expect(res.body).toHaveProperty("id ");
        expect(res.body).toHaveProperty("name");
        expect(res.body).toHaveProperty("name");
        expect(res.body).toHaveProperty("social_media_url");
        expect(res.body).toHaveProperty("UserId");
        done();
      });
  });
  it('should be error no auth (401)', (done) => {
    request(app)
      .get('/socials/10')
      .set({ Authorization: token }) 
      .expect(401)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).toBe('user not found!');
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

