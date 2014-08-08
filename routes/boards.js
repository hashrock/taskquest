var express = require('express');
var http = require('http');
var router = express.Router();
var Ticket = require('../models/ticket');
var Board = require('../models/board');
var dotenv = require('dotenv');
dotenv.load();


router.get('/', function(req, res) {
    Board.find(function(err, boards) {
        if (err) {
            res.send(err);
        }
        if (boards) {
            res.json(boards);
        } else {
            res.json({
                message: "No boards"
            });
        }
    });
});


router.post("/", function(req, res) {
    var board = new Board();
    board.name = req.body.name;
    board.save(function(err) {
        if (err) {
            res.send(err);
        }
        res.json({
            message: "Board Created."
        });
    });
});

router.delete("/:id", function(req, res) {
    Board.remove({
            _id: req.params.id
        },
        function(err) {
            if (err) {
                res.send(err);
            }
            res.json({
                message: "Board deleted."
            });
        });
});

function compose(items, status) {
    return items.filter(function(item) {
        return item.status === status;
    });
}

function postDevHub(ticket, id) {
    if (ticket.status === "done" && process.env.DEVHUB) {
        //タグ文字対策
        var tname = ticket.name;
        tname.replace(/\[/g, "");
        tname.replace(/\]/g, " ");

        //Devhubに送信
        var message = ticket.user + " は " + tname + " をたおした。 [" + id + "](" + process.env.HOST + "/#/" + id + ")";
        var name = "taskquest";
        var url = process.env.DEVHUB + "/notify?name=" + encodeURIComponent(name) + 
        "&msg=" + encodeURIComponent(message);
        http.get(url, function() {});
    }
}

router.get('/:id', function(req, res) {
    Board.findOne({
        name: req.params.id
    }, function(err, board) {
        if (err) {
            res.send(err);
        }
        if (board) {
            Ticket.find({
                board: board._id
            }, function(err, tickets) {
                if (err) {
                    res.send(err);
                }
                var result = {
                    name: board ? board.name : "No Board",
                    sprint: board ? board.sprint : [],
                    backlog: compose(tickets, "backlog"),
                    sprint1: compose(tickets, "sprint1"),
                    sprint2: compose(tickets, "sprint2"),
                    sprint3: compose(tickets, "sprint3"),
                    doing: compose(tickets, "doing"),
                    done: compose(tickets, "done")
                };
                res.json(result);
            });

        }


    });
});

router.post('/:id/tickets/', function(req, res) {
    var ticket = new Ticket();
    ticket.name = req.body.name;
    ticket.user = req.body.user;
    ticket.status = req.body.status;
    ticket.memo = req.body.memo;
    ticket.sprint = req.body.sprint;
    ticket.board = req.body.board;
    ticket.icon = "slime";
    ticket.save(function(err) {
        if (err) {
            res.send(err);
        }
        res.json({
            message: "Saved."
        });
    });

});

router.get('/:id/tickets/:tid', function(req, res) {
    Ticket.findById(req.params.tid, function(err, ticket) {
        if (err) {
            res.send(err);
        }
        res.json(ticket);
    });
});


router.put('/:id/tickets/:tid', function(req, res) {
    Ticket.findById(req.params.tid, function(err, ticket) {
        if (err) {
            res.send(err);
        }
        ticket.name = req.body.name ? req.body.name : ticket.name;
        ticket.user = req.body.user ? req.body.user : ticket.user;
        ticket.status = req.body.status ? req.body.status : ticket.status;
        ticket.memo = req.body.memo ? req.body.memo : ticket.memo;
        ticket.sprint = req.body.sprint ? req.body.sprint : ticket.sprint;
        ticket.icon = req.body.icon ? req.body.icon : ticket.icon;


        console.log("Updated");
        res.json({
            message: "Updated."
        });


        ticket.save(function(err) {
            if (err) {
                res.send(err);
            }
            if(process.env.DEVHUB){
                postDevHub(ticket, req.params.id);
            }
        });
    });
});

router.delete('/:id/tickets/:tid', function(req, res) {
    Ticket.remove({
            _id: req.params.tid
        },
        function(err) {
            if (err) {
                res.send(err);
            }
            res.json({
                message: "Item deleted."
            });
        });
});

module.exports = router;
