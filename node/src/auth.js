const jwt = require('jsonwebtoken');

const secrets = {
  [process.env.JWT_ISS]: process.env.JWT_KEY,
};

function die(req, res) {
  return res.status(401).send('You shall not pass!');
}

function b64decode(data) {
  const buffer = new Buffer(data, 'base64');
  const string = buffer.toString('utf-8');
  return string;
}
function b64decodeJSON(data) {
  const string = b64decode(data);
  const json = JSON.parse(string);
  return json;
}

module.exports.requireAuth = function requireAuth(req, res, next) {
  if (!req.cookies.token)
    return die(req, res);

  const user = b64decodeJSON(req.cookies.token.split('.')[1]);
  if (!user.iss)
    return die(req, res);

  try {
    const verified = jwt.verify(req.cookies.token, secrets[user.iss]);
    if (!verified) return die(req, res);
    req.user = user;
  } catch(e) {
    console.log(e);
    return die(req, res);
  }
  next();
}

module.exports.login = function login(req, res) {
  if (!req.headers.authorization) {
    res.set('WWW-Authenticate', 'Basic realm="blog"');
    return die(req, res);
  }

  const auth = req.headers.authorization.replace('Basic ', '');
  const [username, password] = b64decode(auth).split(':');

  db.execute('SELECT id, username, admin from blog.users WHERE username=? password = sha2(CONCAT(?,salt),256)', [username, password])
    .then(([rows])=>{
      if (!rows.length)
        return die(req, res);
      const iss = process.env.JWT_ISS;
      const user = {...rows[0], iss};
      const token = jwt.sign(user, secrets[iss]);
      res.cookie(process.env.TOKEN_COOKIE_NAME, token);
      res.status(200).send(user);
    }).catch(e=>die(req, res))

}
