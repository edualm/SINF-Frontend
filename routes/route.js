var express = require('express');
var router = express.Router();

var request = require('request');

router.get('/', function(req, res, next) {
    console.log(req.cookies);

    if (req.cookies.route) {
        //  the route has to be calculated.
        
        res.render('route', { title: 'Route', route: JSON.parse(req.cookies.route) });
    } else
        res.render('message', { title: 'Error!', description: 'No route provided.' });

    res.render('route', { title: 'Route' });
});

module.exports = router;
