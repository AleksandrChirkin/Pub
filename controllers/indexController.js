const { body,validationResult } = require('express-validator');
var Table = require('../models/table');
var Dish = require('../models/dish');

var async = require('async');

exports.index = function(req, res) {

    async.parallel({
        tables_count: function(callback) {
            Table.countDocuments({}, callback);
        },
        available_tables_count: function(callback) {
            Table.countDocuments({ 'occupied': false }, callback);
        },
        dishes_count: function(callback) {
            Dish.countDocuments({}, callback);
        },
        available_dishes_count: function(callback) {
            Dish.countDocuments({ 'in_sale': true }, callback);
        }
    }, function(err, results) {
        res.render('index', { title: 'ПАБЪ', error: err, data: results });
    });
};
