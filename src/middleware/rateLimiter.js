const rateLimit = require("express-rate-limit");

module.exports = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "60000", 10), // 1 minute
  max: parseInt(process.env.RATE_LIMIT_MAX || "100", 10),
  message: "Too many requests, please slow down.",
});
