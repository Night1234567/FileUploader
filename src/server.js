const express = require('express');
const AWS = require('aws-sdk');
const multer = require('multer');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const uploadProgress = {};

const _acc_key = require("./acc_key.json");
const { Endpoint, Acc, Secret, Name } = _acc_key;
const ENDPOINT_URL = Endpoint;
const ACCESS_KEY_ID = Acc;
const ACCESS_KEY_SECRET = Secret;
const BUCKET_NAME = Name;

const app = express();
const corsOptions = {
  origin: 'http://localhost:3000', // Replace this with your client's URL
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));

const s3 = new AWS.S3({
  accessKeyId: ACCESS_KEY_ID,
  secretAccessKey: ACCESS_KEY_SECRET,
  endpoint: new AWS.Endpoint(ENDPOINT_URL),
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post('/upload', upload.single('file'), (req, res) => {
  const randomFileName = uuidv4() + path.extname(req.file.originalname);
  const params = {
    Bucket: BUCKET_NAME,
    Key: 'demo/' + randomFileName,
    ContentType: req.file.mimetype,
    Body: req.file.buffer,
    ACL: 'public-read',
  };

  const upload = s3.upload(params);

  req.on('close', () => {
    // Client has closed the connection, stop tracking progress
    delete uploadProgress[randomFileName];
  });

  upload.on('httpUploadProgress', (progress) => {
    uploadProgress[randomFileName] = Math.round((progress.loaded / progress.total) * 100);
  });

  upload.send((err, data) => {
    if (err) {
      console.log(err);
      res.status(500).send('Error uploading file');
    } else {
      console.log('Upload data:', data);
      res.status(200).send({
        message: 'File uploaded successfully',
        url: `${req.protocol}://${req.get('host')}/demo/${randomFileName}`,
        id: randomFileName
      });
    }
  });
});

app.get('/upload/progress/:id', (req, res) => {
  req.socket.setTimeout(Number.MAX_VALUE);
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const id = req.params.id;
  const updateInterval = setInterval(() => {
    res.write(`data: ${uploadProgress[id] || 0}\n\n`);

    // Clear interval if upload is done
    if (uploadProgress[id] === 100) {
      clearInterval(updateInterval);
    }
  }, 1000);
});

app.get('/demo/:filename', async (req, res) => {
  const fileName = req.params.filename;
  const fileKey = `demo/${fileName}`;

  const params = {
    Bucket: BUCKET_NAME,
    Key: fileKey,
  };

  try {
    const signedUrl = await s3.getSignedUrlPromise('getObject', params);
    const imageResponse = await axios.get(signedUrl, { responseType: 'arraybuffer' });
    res.set('Content-Type', imageResponse.headers['content-type']);
    res.send(imageResponse.data);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error retrieving file');
  }
});

app.get('/view/:filename', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Image Viewer</title>
    </head>
    <body>
      <img src="/demo/${req.params.filename}" alt="Image" style="max-width: 100%;">
    </body>
    </html>
  `);
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});