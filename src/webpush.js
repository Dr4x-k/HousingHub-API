const webpush = require("web-push");
require("dotenv").config();

webpush.setVapidDetails(
  "mailto:jabe.4124@gmail.com",
  process.env.PUBLIC_KEY,
  process.env.PRIVATE_KEY
);

module.exports = webpush;
