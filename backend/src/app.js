/*
 * Copyright (C) 2022-2024 David C. Harrison. All right reserved.
 *
 * You may not use, distribute, publish, or modify this code without
 * the express written permission of the copyright holder.
 */
const express = require('express');
const cors = require('cors');
const yaml = require('js-yaml');
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const path = require('path');
const OpenApiValidator = require('express-openapi-validator');

const auth = require('./auth');
const data = require('./data');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: false}));

const apiSpec = path.join(__dirname, '../api/openapi.yaml');
const apidoc = yaml.load(fs.readFileSync(apiSpec, 'utf8'));

app.use(
  '/v0/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(apidoc),
);

app.use(
  OpenApiValidator.middleware({
    apiSpec: apiSpec,
    validateRequests: true,
    validateResponses: true,
  }),
);

// Your routes go here
app.post('/v0/login',     auth.login);
// app.get('/v0/book',       auth.check, book.getAll);
// app.get('/v0/book/:isbn', auth.check, book.getByISBN);
// app.post('/v0/book',      auth.check, book.post);

app.get('/v0/workspace', auth.check, data.getWorkspaceList);
app.get('/v0/workspace/:id/channel', data.getChannelList);
app.get('/v0/channel/:id/message', data.getMessageList);

app.use((err, req, res, next) => {
  // const statusCode = err.status || 500;
  res.status(err.status).json({
    message: err.message,
    errors: err.errors,
    status: err.status,
  });
});

module.exports = app;
