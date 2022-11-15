const express = require('express');
const AppController = require('../controllers/AppController');
const app = require('../server');


app.get('/status', AppController.getStatus);
app.get('/stats', AppController.getStats);
