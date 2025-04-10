const userModel = require("../models/userModel").userModel;
const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient();
const getUserByEmailIdAndPassword = async (email, password) => {
  
  let user = await userModel.findOne(email);
  if (user) {
    if (isUserValid(user, password)) {
      return user;
    }
  }
  return null;
};

const getUserById = async (id) => {
  let user = await userModel.findById(id);
  if (user) {
    return user;
  }
  return null;
};

function isUserValid(user, password) {
  return user.password === password;
}

async function findOrCreateGoogleUser(profile) {
  const googleId = profile.id;
  const email = profile.emails?.[0].value;
  const name = profile.displayName;

  let user = await db.user.findUnique({
    where: { googleId },
  });

  if (!user) {
    user = await db.user.create({
      data: {
        googleId,
        email,
        name
      },
    });
  }

  return user
}

module.exports = {
  getUserByEmailIdAndPassword,
  getUserById,
  findOrCreateGoogleUser
};
