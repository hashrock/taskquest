var express = require('express');
var router = express.Router();
var Log = require('../models/log');
var http = require('http');



router.get('/', function(req, res) {
    Log.find({}, function(err, ticket) {
        if (err) {
            res.send(err);
        }
        res.json(ticket);
    });
});


module.exports = router;
