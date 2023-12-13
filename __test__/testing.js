const { User, Photo, Comment } = require("../models");
const { generateToken } = require("../helpers/jwt");

const dataUser = {
  full_name: "testfull",
  email: "test@gmail.com",
  username: "test",
  password: "password123",
  profile_image_url: "test.img",
  age: 12,
  phone_number: "123456789",
};


const createUser = async () => {
  const user = await User.create(dataUser);
  return {
    id: user.id,
    full_name: user.full_name,
    email: user.email,
    username: user.username,
    password: user.password,
    profile_image_url: user.profile_image_url,
    age: user.age,
    phone_number: user.phone_number,
  };
};

const createPhoto = async ( idPhoto, title, idUser) => {
  try {
    await Photo.create({
      id: idPhoto,
      title: title,
      caption: "captionPhoto",
      poster_image_url: "test.img",
      UserId: idUser,
    });
    console.log("Photo created successfully!");
  } catch (error) {
    console.error("Error creating photo:", error.message);
  }
};

const createComment = async (idComment, idPhoto, idUser, ) => {
  try {
    console.log("idPhoto:", idPhoto);
    console.log("idUser:", idUser);
    await Comment.create({
      id:idComment,
      comment: "commentsTest",
      PhotoId:idPhoto,
      UserId:idUser
    });
    console.log("Comments created successfully!");
  } catch (error) {
    console.error("Error creating comments:", error.message);
  }
};

const generateTokenTesting = async (user) => {
  return generateToken({
    id: user.id,
    email: user.email,
    username: user.username,
    full_name: user.full_name
  });
};

module.exports = { createUser, generateTokenTesting, createPhoto, createComment };
