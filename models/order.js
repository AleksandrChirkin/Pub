var mongoose = require('mongoose');
var moment = require('moment');

var Schema = mongoose.Schema;

var OrderSchema = new Schema(
  {
    name: {type: String, required: true},
    order_time: {type: Date, required: true},
    duration: {type: Number, required: true},
    tables: [{type: Schema.ObjectId, ref: 'Table'}]
  }
);

OrderSchema
.virtual('url')
.get(function () {
  return '/order/' + this._id;
});

OrderSchema
.virtual('normal_time')
.get(function () {
  return moment(this.order_time).format('DD.MM.YYYY HH:mm');
});

OrderSchema
.virtual('duration_in_hours')
.get(function () {
  if (this.duration == 1) { return this.duration + " час"; }
  if (this.duration >= 2 && this.duration <= 4) { return this.duration + " часа"; }
  return this.duration + " часов";
});

module.exports = mongoose.model('Order', OrderSchema);
