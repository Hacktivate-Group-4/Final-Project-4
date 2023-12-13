const request = require("supertest");
const app = require("../index");
const { User, Photo, Comment } = require("../models");
// const { verifyToken } = require('../helpers/jwt');
const { createUser, createPhoto, generateTokenTesting, createComment } = require("./testing");

const dataComment = {
  comment: "commentsTest",
  PhotoId: 2
};

let token;

describe("POST /comments", () => {
  beforeAll(async () => {
    try {
      const user = await createUser();
      token = await generateTokenTesting(user);
      await createPhoto(2,"photo 1", user.id);
    } catch (error) {
      console.error("Error during test setup:", error);
    }
  });
  it('should create Comments success (201)', (done) => {
    request(app)
      .post('/comments')
      .send(dataComment)
      .set({ Authorization: token }) // Menggunakan format Authorization yang sesuai
      .expect(201)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).toHaveProperty("id");
        expect(res.body).toHaveProperty("comment");
        expect(res.body).toHaveProperty("PhotoId");
        expect(res.body).toHaveProperty("UserId");
        done();
      });
  });
  it('should be error no auth (401)', (done) => {
    request(app)
      .post('/comments')
      .send(dataComment)
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
      await Photo.destroy({ where: {} });
      await Comment.destroy({ where: {} });
    } catch (error) {
      console.error("Error during test cleanup:", error);
      app.close();
    }
  });
});

describe("GET /comments", () => {
  beforeAll(async () => {
    try {
      const user = await createUser();
      token = await generateTokenTesting(user);
      await createPhoto(1,"photo 1", user.id);
      await createPhoto(2,"photo 2", user.id);
      await createComment(1, 1, user.id)
      await createComment(2, 2, user.id)
    } catch (error) {
      console.error("Error during test setup:", error);
    }
  });
  it('should create Comments success (200)', (done) => {
    request(app)
      .get('/comments')
      .set({ Authorization: token }) // Menggunakan format Authorization yang sesuai
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).toHaveLength(2);
        expect(res.body[0]).toHaveProperty("id");
        expect(res.body[0]).toHaveProperty("comment");
        expect(res.body[0]).toHaveProperty("PhotoId");
        expect(res.body[0]).toHaveProperty("UserId");
        done();
      });
  });
  it('should be error no auth (401)', (done) => {
    request(app)
      .get('/comments')
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
      await Photo.destroy({ where: {} });
      await Comment.destroy({ where: {} });
    } catch (error) {
      console.error("Error during test cleanup:", error);
    }
  });
});

describe("GET /comments/:id", () => {
  beforeAll(async () => {
    try {
      const user = await createUser();
      token = await generateTokenTesting(user);
      await createPhoto(1,"photo 1", user.id);
      await createPhoto(2,"photo 2", user.id);
      await createComment(1, 1, user.id)
      await createComment(2, 2, user.id)
    } catch (error) {
      console.error("Error during test setup:", error);
    }
  });
  it('should create Comments success (200)', (done) => {
    request(app)
      .get('/comments/1')
      .set({ Authorization: token }) // Menggunakan format Authorization yang sesuai
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.id).toBe(1);
        expect(res.body).toHaveProperty("id");
        expect(res.body).toHaveProperty("comment");
        expect(res.body).toHaveProperty("PhotoId");
        expect(res.body).toHaveProperty("UserId");
        done();
      });
  });
  it('should be error no auth (401)', (done) => {
    request(app)
      .get('/comments')
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
      await Photo.destroy({ where: {} });
      await Comment.destroy({ where: {} });
    } catch (error) {
      console.error("Error during test cleanup:", error);
    }
  });
});

