const { body,validationResult } = require('express-validator');
var Order = require('../models/order');
var Table = require('../models/table');

var async = require('async');

exports.table_list = function(req, res, next) {

    async.parallel({
        orders: function(callback) {
            Order.find(callback);
        },
	tables: function(callback) {
            Table.find(callback);
        },
    }, function(err, results) {
	if(err) { return next(err); }
        res.render('tables', { title: 'Столики', error: err, data: results });
    });
};

exports.table_detail = function(req, res, next) {

    
    Table.findById(req.params.id).exec(function(err, table) {
        if (err) { return next(err); }
        if (table==null) {
            var err = new Error('Столик не найден­!');
            err.status = 404;
            return next(err);
        }
        res.render('table_detail', { table: table } );
    });
};
