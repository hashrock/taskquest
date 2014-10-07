var express = require('express');
var router = express.Router();
var Ticket = require('../models/ticket');
var Board = require('../models/board');
var Log = require('../models/log');
var http = require('http');


function postDevHub(ticket, id) {
    if (ticket.status === "done" && process.env.DEVHUB) {
        //タグ文字対策
        var tname = ticket.name;
        tname = tname.replace("[", "");
        tname = tname.replace("]", " ");

        //Devhubに送信
        var message = ticket.user + " は " + tname + " をたおした。 [" + id + "](" + process.env.HOST + "/#/" + id + ")";
        var name = "taskquest";
        var url = process.env.DEVHUB + "/notify?name=" + encodeURIComponent(name) +
            "&msg=" + encodeURIComponent(message);
        http.get(url, function (res) {
            console.log("Devhub response:" + res.statusCode);
        }).on("error", function (e) {
            console.log("Devhub console error:" + e.message);
        });

    }
}


router.get('/', function (req, res) {
    Ticket.find({}, function (err, ticket) {
        if (err) {
            res.send(err);
        }
        res.json(ticket);
    });
});

router.post('/', function (req, res) {
    var ticket = new Ticket();
    ticket.name = req.body.name;
    ticket.user = req.body.user;
    ticket.status = req.body.status;
    ticket.memo = req.body.memo;
    ticket.sprint = req.body.sprint;
    ticket.board = req.body.board;
    ticket.icon = "slime";
    ticket.save(function (err) {
        if (err) {
            res.send(err);
        }

        var log = new Log();
        log.action = "create";
        log.name = ticket.name;
        log.user = ticket.user;
        log.status = ticket.status;
        log.memo = ticket.memo;
        log.sprint = ticket.sprint;
        log.icon = ticket.icon;
        log.save(function (err) {
            if (err) {
                res.send(err);
            }
        });

        res.json({
            message: "Saved."
        });
    });

});

router.get('/:tid', function (req, res) {
    Ticket.findById(req.params.tid, function (err, ticket) {
        if (err) {
            res.send(err);
        }
        res.json(ticket);
    });
});


router.put('/:tid', function (req, res) {
    Ticket.findById(req.params.tid, function (err, ticket) {
        if (err) {
            res.send(err);
        }
        ticket.name = req.body.name ? req.body.name : ticket.name;
        ticket.user = req.body.user ? req.body.user : ticket.user;
        ticket.status = req.body.status ? req.body.status : ticket.status;
        ticket.memo = req.body.memo ? req.body.memo : ticket.memo;
        ticket.sprint = req.body.sprint ? req.body.sprint : ticket.sprint;
        ticket.icon = req.body.icon ? req.body.icon : ticket.icon;


        res.json({
            message: "Updated."
        });

        ticket.save(function (err) {
            if (err) {
                res.send(err);
            }
            if (process.env.DEVHUB) {
                Board.findById(ticket.board, function (err, board) {
                    postDevHub(ticket, board.name);
                })
            }

            var log = new Log();
            log.action = "update";
            log.name = ticket.name;
            log.user = ticket.user;
            log.status = ticket.status;
            log.memo = ticket.memo;
            log.sprint = ticket.sprint;
            log.icon = ticket.icon;
            log.save(function (err) {
                if (err) {
                    res.send(err);
                }
            });


        });
    });
});

router.delete('/:tid', function (req, res) {
    Ticket.remove({
            _id: req.params.tid
        },
        function (err) {
            if (err) {
                res.send(err);
            }
            res.json({
                message: "Item deleted."
            });
        });
});


module.exports = router;
