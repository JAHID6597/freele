const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);

const store = new MongoDBStore({
  uri: process.env.MONGODB_URI,
  collection: "session",
  expires: 1000 * 60 * 60 * 24 * 30
});

module.exports = store;