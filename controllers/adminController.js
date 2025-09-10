const path = require('path');
const Model = require('../models/Model');

exports.renderAllChats = async (req, res) => {
    try {
        const chats = await Model.getAllAdminChats();

        res.render('admin', {
            title: 'admin',
            chats: chats,
        });
    } catch (err) {
        res.status(500).send('Ошибка сервера: ' + err.message);
    }
};