var express = require('express');
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


module.exports = router;
