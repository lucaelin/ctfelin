const express = require('express');
const {requireAuth} = require('./auth.js');
const {db, sendOne, sendAll, insertOne, updateAll} = require('./db.js');

const router = express.Router();
module.exports.posts = router;

router.get('/posts', (req, res) => {
  sendAll(res, 'SELECT id, created, updated, title FROM posts');
});

router.get('/posts/:search', (req, res) => {
  const search = '%' + req.params.search + '%';
  sendAll(res, 'SELECT id, created, updated, title FROM posts WHERE LOWER(title) LIKE LOWER(?)', [search]);
});

router.get('/post/:id', (req, res) => {
  const id = parseInt(req.params.id);
  sendOne(res, 'SELECT id, created, updated, title FROM posts WHERE id=?', [id], res=>({
    ...res,
    src: '/api/post/'+id+'/body'
  }));
});
router.get('/post/:id/body', async (req, res) => {
  const id = parseInt(req.params.id);
  const query = `
    UPDATE posts
    SET view_count = view_count + 1
    WHERE id = ?
  `;
  await db.execute(query, [id])
  res.set({ 'content-type': 'text/html; charset=utf-8' });
  sendOne(res, 'SELECT body FROM posts WHERE id=?', [id], res=>res.body);
});

router.post('/post', requireAuth, express.text(), (req, res) => {
  console.log(req.query.title, req.body)
  insertOne(res, 'posts', {
    title: req.query.title,
    body: req.body,
  });
});
