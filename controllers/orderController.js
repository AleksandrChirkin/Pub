const { body,validationResult } = require('express-validator');
var Order = require('../models/order');
var Table = require('../models/table');

var async = require('async');

exports.order_create_get = function(req, res, next) {
    Table.find({ 'occupied': false }).exec(function(err, tables) {
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

    body('name', 'Введите Ваше ФИО!').trim().isLength({ min: 1 }).escape(),
    body('order_time', 'Введите время заказа!').trim().isLength({ min: 1 }).escape(),
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
	  Table.find({'occupied': false}).exec(function(err, tables) {
                if (err) { return next(err); }
                for (let i = 0; i < tables.length; i++) {
                    if (order.tables.indexOf(tables[i]._id) > -1) {
                        tables[i].checked=true;
                    }
                }
                res.render('order_form', { title: 'Новый заказ', tables: tables, order: order, errors: errors.array() });
            });
            return;
        } else {
            Table.find({}).exec(function(err, tables){
              for (let i = 0; i < tables.length; i++) {
                if (order.tables.indexOf(tables[i]._id) > -1 && tables[i].occupied) {
                    var err = new Error('Похоже, пока Вы делали заказ, кто-то другой успел занять один из Ваших столиков:(');
            	    err.status = 409;
            	    return next(err);
                }
              }
              order.save(function (err) {
                if (err) { return next(err); }
		res.render('order_success', { title: 'Заказ сделан!', order: order});
              });
              for (let i = 0; i < tables.length; i++) {
                if (order.tables.indexOf(tables[i]._id) > -1) {
                    tables[i].occupied = true;
                    tables[i].order = order;
                    Table.findByIdAndUpdate(tables[i]._id, tables[i], {}, function (err,thetable) {
                        if (err) { return next(err); }
                    });
                }
              }
            });
        }
    }
];

exports.order_detail = function(req, res, next) {

    Order.findById(req.params.id).populate('tables').exec(function(err, order) {
        if (err) { return next(err); }
        if (order==null) {
            var err = new Error('Заказ не найден­!');
            err.status = 404;
            return next(err);
        }
        res.render('order_detail', { order: order } );
    });
};

exports.order_delete_get = function(req, res, next) {

    Order.findById(req.params.id).populate('tables').exec(function(err, order) {
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
   Order.findById(req.body.orderid).populate('tables').exec(function(err, order) {
        if (err) { return next(err); }
        for (let i=0; i<order.tables.length; i++) {
            var newTable = new Table(
                { name: order.tables[i].name,
                  number: order.tables[i].number,
                  price_per_hour: order.tables[i].price_per_hour,
                  capability: order.tables[i].capability,
                  occupied: false,
                  order: null,
                  _id: order.tables[i]._id
                });
            Table.findByIdAndUpdate(order.tables[i]._id, newTable, {}, function (err,thetable) {
                if (err) { return next(err); }
            });
        }
        Order.findByIdAndRemove(req.body.orderid, function deleteOrder(err) {
            if (err) { return next(err); }
                res.redirect('/')
        });
    });
};

exports.order_update_get = function(req, res, next) {

    async.parallel({
        order: function(callback) {
            Order.findById(req.params.id).populate('tables').exec(callback);
        },
        tables: function(callback) {
            Table.find({}).exec(callback);
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
                        results.tables[all_t_iter].checked=true;
                    }
                }
            }
            res.render('order_form', { title: 'Изменение заказа', order: results.order, tables: results.tables });
      });
};

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

    body('name', 'Введите Ваше ФИО!').trim().isLength({ min: 1 }).escape(),
    body('order_time', 'Введите время заказа!').trim().isLength({ min: 1 }).escape(),
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
                    if (order.tables.indexOf(tables[i]._id) > -1) {
                        tables[i].checked=true;
                    }
                }
                res.render('order_form', { title: 'Изменение заказа', tables: tables, order: order, errors: errors.array() });
            });
            return;
        }
        else {
            Table.find({}).populate('order').exec(function(err, tables) {
                if (err) { return next(err); }
                for (let i = 0; i < tables.length; i++) {
                    if (order.tables.indexOf(tables[i]._id) > -1 && tables[i].occupied && tables[i].order._id.toString() != order._id.toString()) {
                        var err = new Error('Похоже, пока Вы меняли заказ, кто-то другой успел занять один из Ваших столиков:(');
            	        err.status = 409;
            	        return next(err);
                    }
                }
                Order.findByIdAndUpdate(req.params.id, order, {}, function (err,theorder) {
                    if (err) { return next(err); }
                });
                for (let i = 0; i < tables.length; i++) {
                    if (order.tables.indexOf(tables[i]._id) > -1) {
                        var newTable = new Table(
                        { name: tables[i].name,
                          number: tables[i].number,
                          price_per_hour: tables[i].price_per_hour,
                          capability: tables[i].capability,
                          occupied: true,
                          order: order,
                          _id: tables[i]._id
                        });
                        Table.findByIdAndUpdate(tables[i]._id, newTable, {}, function (err,thetable) {
                            if (err) { return next(err); }
                        });
                    } else if (order.tables.indexOf(tables[i]._id) == -1 && tables[i].occupied && tables[i].order._id.toString()===order._id.toString()) {
                        var newTable = new Table(
                        { name: tables[i].name,
                          number: tables[i].number,
                          price_per_hour: tables[i].price_per_hour,
                          capability: tables[i].capability,
                          occupied: false,
                          order: null,
                          _id: tables[i]._id
                        });
                        Table.findByIdAndUpdate(tables[i]._id, newTable, {}, function (err,thetable) {
                            if (err) { return next(err); }
                        });
                    }
                }
                res.render('order_success', { title: 'Заказ изменен!', order: order });
            });
        }
    }
];

exports.orders_get = function(req, res, next) {
    res.render('order_select', { title: 'Выбор заказа' });
};

exports.orders_post = function(req, res, next) {

    Order.findById(req.body.id).populate('tables').exec(function(err, order) {
        if (err) { return next(err); }
        if (order==null) {
            var err = new Error('Заказ не найден­!');
            err.status = 404;
            return next(err);
        }
        res.render('order_detail', { order: order } );
    });
};
