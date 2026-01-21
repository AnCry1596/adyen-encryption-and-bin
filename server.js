"use strict";

const express = require('express');
const request_ip = require('request-ip');
const router = require('./router');

const app = express();

app.use(request_ip.mw());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/', router);

app.use(async (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

app.set("json spaces", 4);

const port = process.env.PORT || 5000;
const server = app.listen(port, () => {
  console.log('Server listening on port: ' + port);
});

const shutdown = () => {
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
