var mongoose = require('mongoose');
var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var TicketSchema = new Schema({
    name: String,
    user: String,
    status: String,
    sprint: Number,
    memo: String,
    board: ObjectId,
    icon: String
});

module.exports = mongoose.model('Ticket', TicketSchema);
