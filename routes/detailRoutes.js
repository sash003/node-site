// routes/detailRoutes.js
const express = require('express');
const router = express.Router();
const MainController = require('../controllers/MainController');

router.get('*', (req, res) => {
    // req.slug уже передан в app.use
    MainController.renderPostDetail(req, res);
});

module.exports = router;
