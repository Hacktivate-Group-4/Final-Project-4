const request = require("supertest");
const app = require("../app"); // Gantilah dengan path yang sesuai
const { Pool } = require("pg"); // Import modul PostgreSQL

// Database connection pool for testing
const testDb = new Pool({
  connectionString: process.env.TEST_DB_CONNECTION_STRING,
});

// Data pengguna yang akan digunakan untuk register dan login
const dataUser = {
  email: "testuser@example.com",
  password: "testpassword",
};

// Test suite for user registration
describe("User Registration", () => {
  beforeAll(async () => {
    // Hapus semua data pengguna sebelum pengujian
    await testDb.query("DELETE FROM Users");
  });

  it("Should register a user and return a token", async (done) => {
    // Register a user
    const registerResponse = await request(app).post("/users/register").send(dataUser);

    expect(registerResponse.status).toBe(201);
    expect(registerResponse.body).toHaveProperty("token");
    done();
  });

  it("Should return 'Email already used' for duplicate registration", async (done) => {
    // Coba mendaftarkan pengguna yang sama lagi
    const registerResponse = await request(app).post("/users/register").send(dataUser);

    expect(registerResponse.status).toBe(400);
    expect(registerResponse.body).toHaveProperty("message", "Email already used!");
    done();
  });
});

// Test suite for user login
describe("User Login", () => {
  beforeAll(async () => {
    // Hapus semua data pengguna sebelum pengujian
    await testDb.query("DELETE FROM Users");

    // Mendaftarkan pengguna baru sebelum pengujian
    await request(app).post("/users/register").send(dataUser);
  });

  it("Should login a user and return a token", async (done) => {
    // Login the registered user
    const loginResponse = await request(app).post("/users/login").send(dataUser);

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body).toHaveProperty("access_token");
    done();
  });

  it("Should return 'Email or password invalid' for invalid login", async (done) => {
    // Coba login dengan password yang salah
    const invalidDataUser = {
      email: "testuser@example.com",
      password: "invalidpassword",
    };

    const loginResponse = await request(app).post("/users/login").send(invalidDataUser);

    expect(loginResponse.status).toBe(401);
    expect(loginResponse.body).toHaveProperty("message", "Email or password invalid!");
    done();
  });
});

describe("Test Cases for API create photo", () => {
  beforeAll(async () => {
    try {
      // Create a user and generate an authentication token
      const userResponse = await request(app).post("/users/register").send(dataUser);
      const loginResponse = await request(app).post("/users/login").send({
        email: dataUser.email,
        password: dataUser.password,
      });

      authToken = loginResponse.body.token;
    } catch (error) {
      console.error(error);
    }
  });

  afterAll(async () => {
    try {
      // Destroy the user and related data
      await user.destroy({ where: {} });
      await photo.destroy({ where: {} });
    } catch (error) {
      console.error(error);
    }
  });

  it("Should return a success response", (done) => {
    // Make a request to create a photo with the authToken
    request(app)
      .post("/photos")
      .set("token", authToken) // Use "token" header for authentication
      .expect(201)
      .end((err, res) => {
        if (err) return done(err);
        done();
      });
  });

  it("Should return an error response without authentication", (done) => {
    // Make a request to create a photo without authentication
    request(app)
      .post("/photos")
      .expect(401)
      .end((err, res) => {
        if (err) return done(err);
        done();
      });
  });
});

describe("Test Cases for API get all photos", () => {
  beforeAll(async () => {
    try {
      // Create a user and generate an authentication token
      const userResponse = await request(app).post("/users/register").send(dataUser);
      const loginResponse = await request(app).post("/users/login").send({
        email: dataUser.email,
        password: dataUser.password,
      });

      authToken = loginResponse.body.token;
    } catch (error) {
      console.error(error);
    }
  });

  afterAll(async () => {
    try {
      // Destroy the user and related data
      await user.destroy({ where: {} });
      await photo.destroy({ where: {} });
    } catch (error) {
      console.error(error);
    }
  });

  it("Should return a success response", (done) => {
    // Make a request to get all photos with the authToken
    request(app)
      .get("/photos")
      .set("token", authToken) // Use "token" header for authentication
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        done();
      });
  });

  it("Should return an error response without authentication", (done) => {
    // Make a request to get all photos without authentication
    request(app)
      .get("/photos")
      .expect(401)
      .end((err, res) => {
        if (err) return done(err);
        done();
      });
  });
});

describe("Test Cases for API get photo by ID", () => {
  let photoId; // To store the photo ID

  beforeAll(async () => {
    try {
      // login dan register
      const userResponse = await request(app).post("/users/register").send(dataUser);
      const loginResponse = await request(app).post("/users/login").send({
        email: dataUser.email,
        password: dataUser.password,
      });

      authToken = loginResponse.body.token;
      // Create a photo
      const createResponse = await request(app)
        .post("/photos")
        .set("token", authToken) // Use "token" header for authentication
        .expect(201);

      photoId = createResponse.body.id;
    } catch (error) {
      console.error(error);
    }
  });

  afterAll(async () => {
    try {
      // Destroy the user and related data
      await user.destroy({ where: {} });
      await photo.destroy({ where: {} });
    } catch (error) {
      console.error(error);
    }
  });

  it("Should return a success response", (done) => {
    // Make a request to get the photo by ID with the authToken
    request(app)
      .get(`/photos/${photoId}`)
      .set("token", authToken) // Use "token" header for authentication
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        done();
      });
  });

  it("Should return an error response for a non-existent photo", (done) => {
    // Make a request to get a non-existent photo by ID with the authToken
    request(app)
      .get("/photos/1212")
      .set("token", authToken)
      .expect(404)
      .end((err, res) => {
        if (err) return done(err);
        done();
      });
  });

  it("Should return an error response without authentication", (done) => {
    // Make a request to get a photo by ID without authentication
    request(app)
      .get(`/photos/${photoId}`)
      .expect(401)
      .end((err, res) => {
        if (err) return done(err);
        done();
      });
  });
});
