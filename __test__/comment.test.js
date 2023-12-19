const request = require("supertest");
const app = require("../index");
const { User, Photo, Comment } = require("../models");
const {
  createUser,
  createPhoto,
  generateTokenTesting,
  createComment,
} = require("./testing");

const dataComment = {
  comment: "commentsTest",
  PhotoId: 2,
};
const updateComment = {
  comment: "commentsTestUpdate",
  PhotoId: 2,
};

let token;

// create comments
describe("POST /comments", () => {
  beforeAll(async () => {
    try {
      const user = await createUser();
      token = await generateTokenTesting(user);
      await createPhoto(2, "photo 1", user.id);
    } catch (error) {
      console.error("Error during test setup:", error);
    }
  });
  it("should create Comments success (201)", (done) => {
    request(app)
      .post("/comments")
      .send(dataComment)
      .set({ Authorization: token })
      .expect(201)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).toHaveProperty("id");
        expect(res.body).toHaveProperty("comment");
        expect(res.body).toHaveProperty("PhotoId");
        expect(res.body).toHaveProperty("UserId");
        expect(res.body).toHaveProperty("createdAt");
        expect(res.body).toHaveProperty("updatedAt");
        done();
      });
  });
  it("should be error no auth (401)", (done) => {
    request(app)
      .post("/comments")
      .send(dataComment)
      .set({ Authorization: "" })
      .expect(401)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).toBe("Token not provided!");
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

// views comments all
describe("GET /comments", () => {
  beforeAll(async () => {
    try {
      const user = await createUser();
      token = await generateTokenTesting(user);
      await createPhoto(1, "photo 1", user.id);
      await createPhoto(2, "photo 2", user.id);
      await createComment(1, 1, user.id);
      await createComment(2, 2, user.id);
    } catch (error) {
      console.error("Error during test setup:", error);
    }
  });
  it("should Get Comments success (200)", (done) => {
    request(app)
      .get("/comments")
      .set({ Authorization: token })
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
  it("should be error no auth (401)", (done) => {
    request(app)
      .get("/comments")
      .set({ Authorization: "" })
      .expect(401)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).toBe("Token not provided!");
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

// views comments by id
describe("GET /comments/:id", () => {
  beforeAll(async () => {
    try {
      const user = await createUser();
      token = await generateTokenTesting(user);
      await createPhoto(1, "photo 1", user.id);
      await createPhoto(2, "photo 2", user.id);
      await createComment(1, 1, user.id);
      await createComment(2, 2, user.id);
    } catch (error) {
      console.error("Error during test setup:", error);
    }
  });
  it("should Get Comments success (200)", (done) => {
    request(app)
      .get("/comments/1")
      .set({ Authorization: token })
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
  it("should be error no auth (401)", (done) => {
    request(app)
      .get("/comments")
      .set({ Authorization: "" })
      .expect(401)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).toBe("Token not provided!");
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

// update comments
describe("PUT /comments/2", () => {
  beforeAll(async () => {
    try {
      const user = await createUser();
      token = await generateTokenTesting(user);
      await createPhoto(1, "photo 1", user.id);
      await createPhoto(2, "photo 2", user.id);
      await createComment(1, 1, user.id);
      await createComment(2, 2, user.id);
    } catch (error) {
      console.error("Error during test setup:", error);
    }
  });
  it("should update Comments success (200)", (done) => {
    request(app)
      .put("/comments/2")
      .set({ Authorization: token })
      .expect(200)
      .send(updateComment)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).toHaveProperty("comment", updateComment.comment);
        expect(res.body).toHaveProperty("PhotoId", updateComment.PhotoId);
        done();
      });
  });
  // it("should be error not found (404)", (done) => {
  //   request(app)
  //     .put("/comments/9")
  //     .set({ Authorization: token })
  //     .expect(404)
  //     .send(updateComment)
  //     .end((err, res) => {
  //       if (err) return done(err);
  //       expect(res.body.message).toBe("Comment with id 9 not found");
  //       done();
  //     });
  //   done();
  // });
  it("should be error no auth (401)", (done) => {
    request(app)
      .put("/comments/2")
      .set({ Authorization: "" })
      .expect(401)
      .send(updateComment)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).toBe("Token not provided!");
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

//delete comments
describe("DELETE /comments/1", () => {
  beforeAll(async () => {
    try {
      const user = await createUser();
      token = await generateTokenTesting(user);
      await createPhoto(1, "photo 1", user.id);
      await createPhoto(2, "photo 2", user.id);
      await createComment(1, 1, user.id);
      await createComment(2, 2, user.id);
    } catch (error) {
      console.error("Error during test setup:", error);
    }
  });
  it("should update Comments success (200)", (done) => {
    request(app)
      .delete("/comments/1")
      .set({ Authorization: token })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty(
          "message",
          "Comment with id 1 deleted successfully"
        );
        done();
      });
  });
  // it('should be error not found (404)', (done) => {
  //   request(app)
  //     .delete('/comments/10')
  //     .set({ Authorization: token })
  //     .expect(404)
  //     .end((err, res) => {
  //       if (err) return done(err);
  //       expect(res.status).toBe(404);
  //       expect(res.body && res.body.message).toBe('comment with id 10 not found');
  //       // expect(res.body).toHaveProperty("message", 'Comment with id 10 not found');
  //       done();
  //     });
  // },10000);
  // it('should be error no auth (500)', (done) => {
  //   request(app)
  //     .delete('/coments/1')
  //     .set({ Authorization: token })
  //     // .expect(500)
  //     .end((err, res) => {
  //       if (err) return done(err);
  //       // expect(res.status).toBe(500);
  //       expect(res.body.message).toBe('Internal Server Error');
  //       // expect(res.body).toHaveProperty("message",'Internal Server Error');
  //       done();
  //     });
  // });
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
