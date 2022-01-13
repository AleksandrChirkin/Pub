var mongoose = require('mongoose');

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

module.exports = mongoose.model('Purchase', PurchaseSchema);
