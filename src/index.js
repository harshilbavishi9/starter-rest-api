const express = require("express");
const session = require('express-session');
const cors = require("cors");
const morgan = require("morgan");
const port = 5852;
const app = express();
const path = require('path');
const connectDB = require("./configs/db");
const userRoute = require("./routes/userRoute");
const articleRoute = require("./routes/articleRoute");
const commentRoute = require("./routes/commentRoute");
const chatRoutes = require("./routes/chatRoutes");
const passport = require('passport');
connectDB();
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/user", userRoute);
app.use("/api/article", articleRoute);
app.use("/api/comment", commentRoute);
app.use("/api/chat", chatRoutes);
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}))
app.use(passport.initialize());
app.use(passport.session());
app.listen(port, (err) => {
  if (err) {
    console.log(err);
    return false;
  }
  console.log("Server is running on Port", port);
});