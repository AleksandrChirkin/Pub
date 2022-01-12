const { body,validationResult } = require('express-validator');
var Order = require('../models/order');
var Table = require('../models/table');

var async = require('async');

exports.order_create_get = function(req, res, next) {
	Table.find({}).exec(function(err, tables) {
        if (err) { return next(err); }
        res.render('order_form', { title: 'Новый заказ', tables: tables });
    });
}

exports.order_create_post = [
    (req, res, next) => {
        if(!(req.body.tables instanceof Array)){
            if(typeof req.body.tables ==='undefined')
            req.body.tables = [];
            else
            req.body.tables = new Array(req.body.tables);
        }
        next();
    },

    body('name', 'Введите своё имя!').trim().isLength({ min: 1 }).escape(),
    body('order_time', 'Введите время!').trim().isLength({ min: 1 }).escape(),
	body('duration', 'Введите продолжительность заказа!').trim().isLength({ min: 1 }).escape(),
    body('tables.*').escape(),

    (req, res, next) => {

        const errors = validationResult(req);

        var order = new Order(
          { name: req.body.name,
            order_time: req.body.order_time,
			duration: req.body.duration,
            tables: req.body.tables
           });

        if (!errors.isEmpty()) {
			Table.find({}).exec(function(err, tables) {
                if (err) { return next(err); }
                for (let i = 0; i < tables.length; i++) {
                    if (order.tables.indexOf(tables[i]._id) > -1) {
                        tables[i].checked='true';
                    }
                }
                res.render('order_form', { title: 'Новый заказ', tables: tables, order: order, errors: errors.array() });
            });
            return;
        }
        else {
            order.save(function (err) {
                if (err) { return next(err); }
				   res.render('order_success_form', { title: 'Заказ готов!', id: order._id});
            });
        }
    }
];

exports.order_delete_get = function(req, res, next) {

    Order.findById(req.params.id).exec(function(err, order) {
        if (err) { return next(err); }
        if (order==null) {
            var err = new Error('Заказ не найден!');
            err.status = 404;
            return next(err);
        }
        res.render('order_delete', { title: 'Удаление заказа', order: order } );
    });

};


exports.order_delete_post = function(req, res, next) {

    Order.findById(req.params.id).exec(function(err, results) {
        if (err) { return next(err); }
        else {
            Order.findByIdAndRemove(req.params.id, function deleteOrder(err) {
                if (err) { return next(err); }
                res.redirect('/')
            });
        }
    });
};

render_order_update_form = function(req, res, next) {

    async.parallel({
        order: function(callback) {
            Order.findById(req.params.id).populate('tables').exec(callback);
        },
        tables: function(callback) {
            Table.find(callback);
        },
        }, function(err, results) {
            if (err) { return next(err); }
            if (results.order==null) {
                var err = new Error('Заказ не найден!');
                err.status = 404;
                return next(err);
            }
            for (var all_t_iter = 0; all_t_iter < results.tables.length; all_t_iter++) {
                for (var order_t_iter = 0; order_t_iter < results.order.tables.length; order_t_iter++) {
                    if (results.tables[all_t_iter]._id.toString()===results.order.tables[order_t_iter]._id.toString()) {
                        results.tables[all_t_iter].checked='true';
                    }
                }
            }
            res.render('order_form', { title: 'Изменить заказ', tables: results.tables, order: results.order });
        });
};

exports.order_update_get = render_order_update_form;


exports.order_update_post = [

    (req, res, next) => {
        if(!(req.body.tables instanceof Array)){
            if(typeof req.body.tables==='undefined')
            req.body.tables=[];
            else
            req.body.tables=new Array(req.body.tables);
        }
        next();
    },

    body('name', 'Введите своё имя!').trim().isLength({ min: 1 }).escape(),
    body('order_time', 'Введите время!').trim().isLength({ min: 1 }).escape(),
	body('duration', 'Введите продолжительность заказа!').trim().isLength({ min: 1 }).escape(),
    body('tables.*').escape(),

    (req, res, next) => {

        const errors = validationResult(req);

        var order = new Order(
          { name: req.body.name,
            order_time: req.body.order_time,
			duration: req.body.duration,
            tables: (typeof req.body.tables==='undefined') ? [] : req.body.tables,
            _id:req.params.id
           });

        if (!errors.isEmpty()) {
            Table.find({}).exec(function(err, tables) {
                if (err) { return next(err); }

                for (let i = 0; i < tables.length; i++) {
                    if (order.genre.indexOf(tables[i]._id) > -1) {
                        tables.genres[i].checked='true';
                    }
                }
                res.render('order_form', { title: 'Изменить заказ', tables: tables, order: order, errors: errors.array() });
            });
            return;
        }
        else {
            Order.findByIdAndUpdate(req.params.id, order, {}, function (err,theorder) {
                if (err) { return next(err); }
                   res.render('order_success_form', { title: 'Заказ готов!', id: order._id});
                });
        }
    }
];

exports.orders_get = function(req, res, next) {
	Order.find({}).exec(function(err, orders) {
		if(err) { return next(err); }
		res.render('order_select', { title: 'Найти заказ', orders: orders })
	});
};

exports.orders_post = render_order_update_form;