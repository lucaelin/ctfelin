const express = require('express');
const {requireAuth, login} = require('./auth.js');
const {db, sendOne, sendAll, insertOne} = require('./db.js');

const router = express.Router();
module.exports.complain = router;

router.post('/complain', express.text(), (req, res) => {
  if (typeof req.body === 'string' || /^https?\:\/\//.test(req.body))
    insertOne(res, 'complaints', {url: req.body});
  else
    res.sendStatus(400);
});
router.get('/complaints', requireAuth, (req, res) => {
  sendAll(res, 'SELECT * FROM complaints WHERE seen = 0');
  db.execute('UPDATE complaints SET seen = 1;');
});
