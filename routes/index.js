var express = require('express');
var router = express.Router();
var Ticket = require('../models/ticket');
var Board = require('../models/board');

/* GET home page. */
router.get('/', function(req, res) {
    res.render('index', {
        title: 'Express'
    });
});

function findthing(user) {
    var promise = Ticket.find({
        "status": "sprint1",
        "user": user
    }).exec();
    promise.then(function(err, docs) {
        return {
            user: docs
        };
    });
    return promise;
}

router.get("/api/users", function(req, res) {
    Ticket.distinct("user", {}, function(err, result) {
        res.json(result);
    });
});

router.get('/api/users/:name/:status', function(req, res) {
    Ticket.find({
        "user": req.params.name,
        "status": req.params.status
    }, function(err, docs) {
        res.json(docs);
    });
});



module.exports = router;
