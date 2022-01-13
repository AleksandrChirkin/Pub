var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var OrderSchema = new Schema(
  {
    name: {type: String, required: true},
    order_time: {type: Date, required: true},
    duration: {type: NumberInt, required: true},
    tables: [{type: Schema.ObjectId, ref: 'Table'}]
  }
);

OrderSchema
.virtual('url')
.get(function () {
  return '/order/' + this._id;
});

module.exports = mongoose.model('Order', OrderSchema);
