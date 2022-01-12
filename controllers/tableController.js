const { body,validationResult } = require('express-validator');
var Order = require('../models/order');
var Table = require('../models/table');

var async = require('async');

exports.index = function(req, res) {

    async.parallel({
        table_count: function(callback) {
            Table.countDocuments({}, callback);
        },
        order_count: function(callback) {
            Order.countDocuments({}, callback);
        },
    }, function(err, results) {
        res.render('index', { title: 'ПАБЪ', error: err, data: results });
    });
};



exports.table_list = function(req, res) {

    async.parallel({
        orders: function(callback) {
            Order.find(callback);
        },
		tables: function(callback) {
            Table.find(callback);
        },
    }, function(err, results) {
		for (let i=0; i<results.orders.length; i++) {
			if (results.orders[i].order_time.getTime() + results.orders[i].duration*3600000 < Date.now()) { //áâ®«šª § ª § ­ (š ¥£® ¡à®­ì ­¥ § ª®­ç¥­ )
				for (let j=0; j<results.orders[i].tables.length; j++){
					if (!results.orders[i].tables[j].occupied){
						results.orders[i].tables[j].occupied = true;
						Table.findByIdAndUpdate(results.orders[i].tables[j]._id, results.orders[i].tables[j], {}, function (err) {
						if (err) { return next(err); }
						});
					}
				}
			}
		}
		for (let i=0; i<results.tables.length; i++){
			var isOccupied = false;
			for (let j=0; j<results.orders.length; j++) {
				if (results.orders[i].order_time.getTime() + results.orders[i].duration*3600000 < Date.now()) {//áâ®«šª § ª § ­ (š ¥£® ¡à®­ì ­¥ § ª®­ç¥­ )
					isOccupied = true;
					break; 
				}
			}
			if (!isOccupied && results.tables[i].occupied) {
				results.tables[i].occupied = false;
				Table.findByIdAndUpdate(results.tables[i]._id, results.tables[i], {}, function (err) {
					if (err) { return next(err); }
				});
			}
		}
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
        res.render('table_detail', { title: table.name, table: table } );
    });
};
