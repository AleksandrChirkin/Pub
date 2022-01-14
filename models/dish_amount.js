var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var DishAmountSchema = new Schema(
  {
    dish: {type: Schema.ObjectId, ref: 'Dish'},
    number: {type: Number, required: true}
  }
);

module.exports = mongoose.model('DishAmount', DishAmountSchema);
