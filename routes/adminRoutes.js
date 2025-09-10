// routes/detailRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.get('*', (req, res) => {
    // req.gameSlug уже передан в app.use
    adminController.renderAllChats(req, res);
});

module.exports = router;
