const express = require('express');
const fs = require('fs');
const filetype = require('file-type');

const router = express.Router();
module.exports.upload = router;

/*
 * Authenticated POST /upload/:name
 * upload a file to the images directory
 */
const allowedTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];
router.post('/:name',
  express.raw({type: allowedTypes, limit: '100mb'}),
  (req, res) => {
    console.log(req.originalUrl)
    if (!(req.body instanceof Buffer))
      return res.status(400).send('You need to upload an image!');

    // express only checks content-type header which can be changed
    // so it's good to check the files contents mime info as well
    filetype.fromBuffer(req.body).then((type)=>{
      if (!allowedTypes.includes(type.mime))
        return res.status(403).send('This mimetype is now allowed!');

      fs.writeFileSync('./media/'+req.params.name, req.body);

      res.status(200).send({
        location: './media/'+req.params.name,
        mime: type.mime
      });
    })
  }
);
