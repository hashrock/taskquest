var express = require('express');
var router = express.Router();
var Ticket = require('../models/ticket');

router.get('/', function(req, res) {
    Ticket.find({}, function(err, ticket) {
        if (err) {
            res.send(err);
        }
        res.json(ticket);
    });
});

module.exports = router;
