var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var TableSchema = new Schema(
  {
    name: {type: String, required: true, default: 'Безымянный'},
    number: {type: Number, required: true},
    price_per_hour: {type: Number, required: true},
    capability: {type: Number, required: true},
    occupied: {type: Boolean, required: true},
    order: {type: Schema.ObjectId, ref: 'Order'},
  }
);

TableSchema
.virtual('url')
.get(function () {
  return '/table/' + this._id;
});

TableSchema
.virtual('capacity')
.get(function () {
  if (this.capability % 10 == 0 || this.capability % 10 >= 5 || (this.capability % 100 > 10 && this.capability % 100 < 20)) { return this.capability + " мест"; }
  if (this.capability % 10 == 1 && !(this.capability % 100 > 10 && this.capability % 100 < 20)) { return this.capability + " место"; }
  return this.capability + " места";
});

module.exports = mongoose.model('Table', TableSchema);
