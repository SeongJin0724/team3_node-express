var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const nunjucks = require('nunjucks');
const PORT = process.env.PORT || 4000;
const bodyParser = require('body-parser');
const cors = require("cors");
const db = require("./config/db");
const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'njk');
nunjucks.configure('views', {
  express: app,
  watch: true,
});

app.use(logger('dev'));
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors({
  origin: "*",
  credentials: true,
  optionsSuccessStatus: 200,
}));
app.use(express.static(path.join(__dirname, 'public')));

// 회원가입 API
app.post('/api/signup', async (req, res, next) => {
  const { user_id, name, email, password, tel, dateJoined, address } = req.body;
  const hashedPassword = await bcrypt.hash(password, 8);

  const sql = 'INSERT INTO user (user_id, name, email, password, tel, dateJoined, address) VALUES (?, ?, ?, ?, ?, ?, ?)';
  db.query(sql, [user_id, name, email, hashedPassword, tel, dateJoined, address], (err, result) => {
    if (err) return next(err);
    res.send({ message: 'User registered successfully!' });
  });
});

// 로그인 API
app.post('/api/login', async (req, res, next) => {
  const { email, password } = req.body;
  
  const sql = 'SELECT * FROM user WHERE email = ?';
  db.query(sql, [email], async (err, result) => {
    if (err) return next(err);
    if (result.length > 0) {
      const comparison = await bcrypt.compare(password, result[0].password);
      if (comparison) {
        res.send({ message: 'Logged in successfully!' });
        // 로그인 성공 시 추가 로직
      } else {
        res.status(401).send({ message: 'Invalid email or password' });
      }
    } else {
      res.status(404).send({ message: 'User not found' });
    }
  });
});

app.get("/product", (req, res, next) => {
  db.query("select * from itemForm", (err, data) => {
    if (err) return next(err);
    res.send(data);
  });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(PORT, () => {
  console.log(`Server On : http://localhost:${PORT}`);
});

module.exports = app;
