const { body,validationResult } = require('express-validator');
var Dish = require('../models/dish');

var async = require('async');


exports.dish_list = function(req, res, next) {
    Dish.find({}).exec(function(err, results){
        res.render('dishes', { title: 'Блюда', error: err, data: results });
    });
};

exports.dish_detail = function(req, res, next) {

    
    Dish.findById(req.params.id).exec(function(err, dish) {
        if (err) { return next(err); }
        if (dish==null) {
            var err = new Error('Блюдо не найдено!');
            err.status = 404;
            return next(err);
        }
        res.render('dish_detail', { dish: dish } );
    });
};
