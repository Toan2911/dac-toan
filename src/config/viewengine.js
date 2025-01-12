const path = require('path');
const express = require('express')

const configviewengine = (app) => {
    const viewsPath = path.join(__dirname, '..', 'views');
    const publicPath = path.join(__dirname, '..', 'public');
    
    console.log('Views directory:', viewsPath);
    console.log('Public directory:', publicPath);
    
    app.set('views', viewsPath);
    app.set('view engine', 'ejs');
    app.use(express.static(publicPath));
}

module.exports = configviewengine;