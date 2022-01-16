var mongoose = require('mongoose');
var moment = require('moment');

var Schema = mongoose.Schema;

var PurchaseSchema = new Schema(
  {
    name: {type: String, required: true},
    purchase_time: {type: Date, required: true},
    dishes: [{type: Schema.ObjectId, ref: 'Dish'}]
  }
);

PurchaseSchema
.virtual('url')
.get(function () {
  return '/purchase/' + this._id;
});

PurchaseSchema
.virtual('normal_time')
.get(function () {
  return moment(this.purchase_time).format('DD.MM.YYYY HH:mm');
});

module.exports = mongoose.model('Purchase', PurchaseSchema);
