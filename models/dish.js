var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var DishSchema = new Schema(
  {
    name: {type: String, required: true},
    description: {type: String},
    price: {type: Number, required: true},
    remains: {type: Boolean, required: true}
  }
);

DishSchema
.virtual('url')
.get(function () {
  return '/dish/' + this.number;
});

module.exports = mongoose.model('Dish', DishSchema);
