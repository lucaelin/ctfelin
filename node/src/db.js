const mysql = require('mysql2/promise');

const allowedTypes = ['number', 'boolean', 'string'];
function forbiddenValueType(v) {
  if (typeof v === 'number') return false;
  if (typeof v === 'boolean') return false;
  if (typeof v === 'string') return false;
  if (v === null) return false;
  return true;
}

const db = mysql.createPool({
  host: 'db',
  user: 'root',
  password: '',
  database: process.env.MYSQL_DATABASE,
  timezone: 'Z'
});
module.exports.db = db;

module.exports.sendOne = (res, query, options=[], mod = (res)=>res) => {
  db.execute(query, options).then(([rows])=>{
    if (rows[0])
      return res.send(mod(rows[0]));
    res.sendStatus(404);
  }).catch((e)=>res.status(500).send(e));
}

module.exports.sendAll = (res, query, options=[], mod = (res)=>res) => {
  db.execute(query, options).then(([rows])=>{
    const modded = rows.map(mod);
    res.send(modded);
  }).catch((e)=>res.status(500).send(e));
}

module.exports.insertOne = (res, table, data) => {
  const keys = Object.keys(data);
  const questionmarks = keys.map(k=>'?');
  const options = Object.values(data);
  if (options.find((v)=>forbiddenValueType(v)))
    return res.status(400).send('Invalid SQL Values detected!');

  const query = `INSERT INTO ${table} (${keys}) VALUES (${questionmarks})`
  db.execute(query, options).then(([rows])=>{
    res.sendStatus(200);
  }).catch((e)=>res.status(500).send(e));
}

module.exports.updateAll = (res, table, data) => {
  const keys = Object.keys(data);
  const questionmarks = keys.map(k=>'?');
  const options = Object.values(data);
  if (options.find((v)=>forbiddenValueType(v)))
    return res.status(400).send('Invalid SQL Values detected!');

  const query = `INSERT INTO ${table} (${keys}) VALUES (${questionmarks})`
  db.execute(query, options).then(([rows])=>{
    res.sendStatus(200);
  }).catch((e)=>res.status(500).send(e));
}
