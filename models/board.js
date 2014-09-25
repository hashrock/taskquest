var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');

var Schema = mongoose.Schema;

var BoardSchema = new Schema({
    name: String
});
BoardSchema.plugin(timestamps);

module.exports = mongoose.model('Board', BoardSchema);
