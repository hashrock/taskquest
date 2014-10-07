var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');
var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var LogSchema = new Schema({
    name: String,
    user: String,
    status: String,
    sprint: Number,
    memo: String,
    board: ObjectId,
    icon: String,
    action: String
});
LogSchema.plugin(timestamps);
module.exports = mongoose.model('Log', LogSchema);
