const express = require('express');
const router = express.Router();
router.get('/api/admin/delete-user', (req, res) => {

    res.render('dlvud.ejs')
});

router.get('/api/register', (req, res) => {

    res.render('cc.ejs')
});
router.get('/api/login', (req, res) => {

    res.render('login.ejs')
});
router.get('/api/admin', (req, res) => {

    res.render('admin.ejs')
});
router.get('/', (req, res) => {

    res.render('home.ejs')
});
module.exports = router