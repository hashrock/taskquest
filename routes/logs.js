var express = require('express');
var router = express.Router();
var Log = require('../models/log');
var http = require('http');



router.get('/', function(req, res) {
    var limit = req.param("limit") ? req.param("limit") : 100;
    var user = req.param("user");
    var status =  req.param("status");

    var cond = {};
    if(user){
        cond.user = user;
    }
    if(status){
        cond.status = status;
    }

    Log.find(cond)
        .sort('-updatedAt')
        .limit(limit)
        .exec(function(err, ticket) {
            if (err) {
                res.send(err);
            }
            res.json(ticket);
        });
});


module.exports = router;
