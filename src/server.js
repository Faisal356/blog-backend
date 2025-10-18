require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const connectDB = require("./config/db");
const rateLimiter = require("./middleware/rateLimiter");
const errorHandler = require("./middleware/errorHandler");


// routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const postRoutes = require("./routes/posts");
const categoryRoutes = require("./routes/categories");
const tagRoutes = require("./routes/tags");
const commentRoutes = require("./routes/comments");

const app = express();

// connect DB
connectDB(process.env.MONGO_URI);

// middlewares
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(rateLimiter);

// api routes
app.use("/api/auth", authRoutes);
// app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/tags", tagRoutes);
// app.use("/api/comments", commentRoutes);

// health
app.get("/health", (req, res) => res.json({ ok: true }));

// error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
