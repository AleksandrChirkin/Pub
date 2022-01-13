var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var TableSchema = new Schema(
  {
    name: {type: String},
    number: {type: NumberInt, required: true},
    price_per_hour: {type: Number, required: true},
    occupied: {type: Boolean, required: true},
    order: {type: Schema.ObjectId, ref: 'Order'},
  }
);

TableSchema
.virtual('url')
.get(function () {
  return '/table/' + this.number;
});

module.exports = mongoose.model('Table', TableSchema);
