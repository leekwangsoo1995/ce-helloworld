const express = require('express');
const util = require("util");
const os = require('os');
const path = require('path');

const hostname = os.hostname();
const port = process.env.PORT || 8080;
const app = express();

const BASIC_AUTH_USERNAME = process.env.BASIC_AUTH_USERNAME || 'admin';
const BASIC_AUTH_PASSWORD = process.env.BASIC_AUTH_PASSWORD || 'password';

const basicAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    res.set('WWW-Authenticate', 'Basic realm="Protected Area"');
    return res.status(401).send('Authentication required');
  }
  
  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
  const [username, password] = credentials.split(':');
  
  if (username === BASIC_AUTH_USERNAME && password === BASIC_AUTH_PASSWORD) {
    next();
  } else {
    res.set('WWW-Authenticate', 'Basic realm="Protected Area"');
    return res.status(401).send('Invalid credentials');
  }
};

app.use('/images', basicAuth, express.static(path.join(__dirname, 'public/images')));
app.use('/css', basicAuth, express.static(path.join(__dirname, 'public/css')));
app.use('/js', basicAuth, express.static(path.join(__dirname, 'public/js')));

const msg = process.env.MSG ? process.env.MSG : 'I was built by Buildpacks with Code Engine!';

app.get('/', basicAuth, (request, response) => {
  response.send(util.format(`<!DOCTYPE html>
<html>
  <head>
    <title>Hello World</title>
    <meta charset="UTF-8">
  </head>
  <body>
    <div class="center-box">
      <img src="/images/developer.png" alt="Developer">
      <h1>Hello, World</h1>
      <p>%s</p>
      <p>hostname: %s</p>
    </div>
  </body>
  <style>
    .center-box{
      text-align:center;
      margin-top: 50px;
    }
    img {
      width: 300px;
      max-width: 100%%;
    }
    body {
      font-family: Arial, sans-serif;
      background-color: #f0f0f0;
    }
    h1 {
      color: #333;
    }
    p {
      color: #666;
      margin: 10px 0;
    }
  </style>
</html>`, msg, hostname));
});

app.listen(port, () => {
  console.log('Server running at http://localhost:' + port + '/');
  console.log('Basic Auth - Username: ' + BASIC_AUTH_USERNAME + ', Password: ' + BASIC_AUTH_PASSWORD);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nServer shutting down...');
  process.exit(0);
});