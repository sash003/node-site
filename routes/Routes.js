const express = require('express');
const router = express.Router();
const MainController = require('../controllers/MainController');

// Главная страница
router.get('/', MainController.renderPage);

// Любая другая страница
router.get('/:page', MainController.renderPage);

module.exports = router;
