process.on('unhandledRejection', error => {
  console.error('unhandledRejection', error.message);
  process.exit(-1);
});
process.on('uncaughtException', error => {
  console.error('uncaughtException', error.message);
  process.exit(-1);
});

const express = require('express');
const cookieParser = require('cookie-parser');
const mysql = require('mysql2/promise');

const test = require('./test.js');
const {requireAuth, login} = require('./auth.js');
const {upload} = require('./upload.js');
const {posts} = require('./posts.js');
const {complain} = require('./complain.js');
const {db, sendOne, sendAll, insertOne} = require('./db.js');

const app = express();
app.use(express.urlencoded({extended: true}));
app.use(cookieParser())

app.get('/login', login);
app.get('/admin', requireAuth, (req, res) => {
  res.send(req.user);
});

app.use(complain);
app.use(posts);

app.use('/upload', requireAuth, upload);

app.listen(process.env.NODE_PORT);
module.exports.app = app;
