const request = require("supertest");
const app = require("../index");
const { User, Photo, Comment } = require("../models");
const {
  createUser,
  createPhoto,
  generateTokenTesting,
  createComment,
} = require("../testing");

const dataComment = {
  comment: "commentsTest",
  PhotoId: 2,
};
const updateComment = {
  comment: "commentsTestUpdate",

  PhotoId: 2,
};

let token;
// let server;

// create comments
describe("POST /comments", () => {
  // beforeAll(async () => {
  //   server = app.listen();
  // });
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
  it("should be error no auth (400)", (done) => {
    const testComment = {
      comment: "commentsTest",
    };
    request(app)
      .post("/comments")
      .send(testComment)
      .set({ Authorization: token })
      .expect(400)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty("code", 400);
        expect(res.body).toHaveProperty(
          "message",
          "comment and PhotoId required fields."
        );
        expect(res.body.data).toHaveProperty("comment", testComment.comment);
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
  // afterAll(async (done) => {
  //   server.close(done);
  // })
});

// views comments all
describe("GET /comments", () => {
  // beforeAll(async () => {
  //   server = app.listen();
  // });
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
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
        const comment = res.body[0];
        expect(res.body).toHaveLength(2);
        expect(comment).toHaveProperty("id");
        expect(comment).toHaveProperty("comment");
        expect(comment).toHaveProperty("PhotoId");
        expect(comment).toHaveProperty("UserId");
        expect(comment.User).toHaveProperty("full_name");
        expect(comment.User).toHaveProperty("email");
        expect(comment.User).toHaveProperty("username");
        expect(comment.User).toHaveProperty("password");
        expect(comment.User).toHaveProperty("profile_image_url");
        expect(comment.User).toHaveProperty("age");
        expect(comment.User).toHaveProperty("phone_number");
        expect(comment.Photo).toHaveProperty("title");
        expect(comment.Photo).toHaveProperty("caption");
        expect(comment.Photo).toHaveProperty("poster_image_url");
        done();
      });
  });
  it("should handle case where there are no Comments and return status 404 with appropriate message", async () => {
    const commentsCount = await Comment.count();
    if (commentsCount > 0) {
      await Comment.destroy({
        where: {},
        truncate: true,
      });
    }
    request(app)
      .get("/comments")
      .set({ Authorization: token })
      .expect(404)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.status).toBe(404);
        expect(res.body).toEqual({
          code: 404,
          message: "Tidak ada komentar yang tersedia.",
        });
        expect(res.body).toHaveProperty("code", 404);
        expect(res.body).toHaveProperty(
          "message",
          "Tidak ada komentar yang tersedia."
        );
        expect(commentsCount).toBe(2);
        // done();
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
  // afterAll(async (done) => {
  //   server.close(done);
  // })
});

// views comments by id
describe("GET /comments/:id", () => {
  // beforeAll(async () => {
  //   server = app.listen();
  // });
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
      .get("/comments/1")
      .set({ Authorization: "" })
      .expect(401)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).toBe("Token not provided!");
        done();
      });
  });
  it("should handle case where there are no Comments by Id and return status 404 with appropriate message", async () => {
    const commentsCount = await Comment.count();
    if (commentsCount > 0) {
      await Comment.destroy({
        where: {},
        truncate: true,
      });
    }
    request(app)
      .get("/comments/1")
      .set({ Authorization: token })
      .expect(404)
      .end((err, res, done) => {
        if (err) return err;
        expect(res.status).toBe(404);
        expect(res.body).toHaveProperty("code", 404);
        expect(res.body).toHaveProperty("message", "Not Found");
        expect(commentsCount).toBe(2);
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
  // afterAll(async (done) => {
  //   server.close(done);
  // })
});

// update comments
describe("PUT /comments/2", () => {
  // beforeAll(async () => {
  //   server = app.listen();
  // });
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
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("comment", updateComment.comment);
        expect(res.body).toHaveProperty("PhotoId", updateComment.PhotoId);
        // expect(res.body[0].UserId).toBe(user.id);
        expect(res.body).toHaveProperty("createdAt");
        expect(res.body).toHaveProperty("updatedAt");
        done();
      });
  });
  it("should be error validasi (400)", (done) => {
    const testComment = {
      comment: "commentslagi",
    };
    request(app)
      .put("/comments/2")
      .send(testComment)
      .set({ Authorization: token })
      .expect(400)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty("code", 400);
        expect(res.body).toHaveProperty(
          "message",
          "comment and PhotoId required fields."
        );
        expect(res.body).toHaveProperty(
          "name",
          "required fields not provided!"
        );
        done();
      });
  });
  it("should be error not found (404)", (done) => {
    const idEx = 9999;
    request(app)
      .put(`/comments/${idEx}`)
      .set({ Authorization: token })
      .expect(404)
      .send(updateComment)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.status).toBe(404);
        // expect(res.body).toHaveProperty("code", 404);
        expect(res.body).toHaveProperty("name", "Data not found");
        expect(res.body).toHaveProperty(
          "devMessage",
          `comment with id ${idEx} not found`
        );
        expect(res.body).toHaveProperty(
          "devMessage",
          `comment with id ${idEx} not found`
        );
        expect(res.body).toHaveProperty("name", "Data not found");
        // expect(res.body).toEqual({
        //   code: 404,
        //   devMessage: `comment with id ${idEx} not found`,
        //   name: "Data not found",
        // });
        done();
      });
  });

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
  // afterAll(async (done) => {
  //   server.close(done);
  // })
});

//delete comments
describe("DELETE /comments/1", () => {
  // beforeAll(async () => {
  //   server = app.listen();
  // });
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
  // it("should return 401 or 403 when deleting without authorization", async () => {
  //   // other user initiate
  //   const otherUser = {
  //     full_name: "liu kang",
  //     email: "liukang@gmail.com",
  //     username: "liukang",
  //     password: "password123",
  //     profile_image_url:
  //       "https://plus.unsplash.com/premium_photo-1700782893131-1f17b56098d0?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxlZGl0b3JpYWwtZmVlZHwyfHx8ZW58MHx8fHx8",
  //     age: 34,
  //     phone_number: "123456789",
  //   };
  //   const user = await createUser();
  //   token = await generateTokenTesting(otherUser);

  //   const createPhotoResponse = await request(server)
  //     .post("/photos")
  //     .set("token", token) // create with user token
  //     .send(newPhotoData);

  //   // try to delete ur photo using other user token
  //   const response = await request(app)
  //     .delete(`/photos/${createPhotoResponse.body.id}`)
  //     .set("token", otherUserToken);

  //   expect(response.status).toBe(403);
  //   expect(response.body).toHaveProperty("code", 403);
  //   expect(response.body).toHaveProperty("name", "Authorization failed");
  //   expect(response.body).toHaveProperty(
  //     "devMessage",
  //     "User with id undefined does not have permission to access the photo"
  //   );

  //   // cek di database apakah data masih ada
  //   const photoDataFromDatabase = await Photo.findByPk(
  //     createPhotoResponse.body.id
  //   );
  //   expect(photoDataFromDatabase).toHaveProperty(
  //     "title",
  //     createPhotoResponse.body.title
  //   );
  //   expect(photoDataFromDatabase).toHaveProperty(
  //     "caption",
  //     createPhotoResponse.body.caption
  //   );
  //   expect(photoDataFromDatabase).toHaveProperty(
  //     "poster_image_url",
  //     createPhotoResponse.body.poster_image_url
  //   );
  // });
  it("should return 404 when trying to delete a non-existing resource", (done) => {
    const idEx = 9999;
    request(app)
      .delete(`/comments/${idEx}`)
      .set({ Authorization: token })
      .expect(404)
      .send(dataComment)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.status).toBe(404);
        // expect(res.body).toHaveProperty("code", 404);
        expect(res.body).toHaveProperty("name", "Data not found");
        expect(res.body).toHaveProperty(
          "devMessage",
          `comment with id ${idEx} not found`
        );
        expect(res.body).toEqual({
          // code: 404,
          devMessage: `comment with id ${idEx} not found`,
          name: "Data not found",
        });
        done();
      });
  });
  it("should be error no auth (401)", (done) => {
    request(app)
      .delete("/comments/2")
      .set({ Authorization: "" })
      .expect(401)
      .send(dataComment)
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
  // afterAll(async (done) => {
  //   server.close(done);
  // })
});
