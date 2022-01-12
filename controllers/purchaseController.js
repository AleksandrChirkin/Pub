const { body,validationResult } = require('express-validator');
var Purchase = require('../models/purchase');
var Dish = require('../models/dish');

var async = require('async');

exports.purchase_create_get = function(req, res, next) {
	Dish.find({}).exec(function(err, dishes) {
            if (err) { return next(err); }
            res.render('purchase_form', { title: 'Новый заказ', dishes: dishes });
        });
}

exports.purchase_create_post = [
    (req, res, next) => {
        if(!(req.body.dishes instanceof Array)){
            if(typeof req.body.dishes ==='undefined')
            req.body.dishes = [];
            else
            req.body.dishes = new Array(req.body.dishes);
        }
        next();
    },

    body('name', 'Введите Ваше ФИО!').trim().isLength({ min: 1 }).escape(),
    body('purchase_time', 'Введите время, на которое хоите сделать заказ!').trim().isLength({ min: 1 }).escape(),
    body('dishes.*').escape(),

    (req, res, next) => {

        const errors = validationResult(req);

        var purchase = new Purchase(
          { name: req.body.name,
            purchase_time: req.body.purchase_time,
			duration: req.body.duration,
            dishies: req.body.dishes
           });

        if (!errors.isEmpty()) {
			Dish.find({}).exec(function(err, dishes) {
                if (err) { return next(err); }
                for (let i = 0; i < dishes.length; i++) {
                    if (purchase.dishes.indexOf(dishes[i]._id) > -1) {
                        dishes[i].checked='true';
                    }
                }
                res.render('purchase_form', { title: 'Новый заказ', dishes: dishes, purchase: purchase, errors: errors.array() });
            });
            return;
        }
        else {
            Purchase.save(function (err) {
                if (err) { return next(err); }
				   res.render('purchase_success_form', { title: 'Заказ сделан!', id: purchase._id});
            });
        }
    }
];

exports.purchase_delete_get = function(req, res, next) {

    Purchase.findById(req.params.id).exec(function(err, purchase) {
        if (err) { return next(err); }
        if (purchase==null) {
            var err = new Error('Заказ не найден!');
            err.status = 404;
            return next(err);
        }
        res.render('purchase_delete', { title: 'Удаление заказа', purchase: purchase } );
    });

};


exports.purchase_delete_post = function(req, res, next) {
   Purchase.findByIdAndRemove(req.params.id, function deletepurchase(err) {
       if (err) { return next(err); }
         res.redirect('/')
   });
};

render_purchase_update_form = function(req, res, next) {

    async.parallel({
        purchase: function(callback) {
            Purchase.findById(req.params.id).populate('dishes').exec(callback);
        },
        dishes: function(callback) {
            Dish.find(callback);
        },
        }, function(err, results) {
            if (err) { return next(err); }
            if (results.purchase==null) {
                var err = new Error('Заказ не найден!');
                err.status = 404;
                return next(err);
            }
            for (var all_t_iter = 0; all_t_iter < results.dishs.length; all_t_iter++) {
                for (var purchase_t_iter = 0; purchase_t_iter < results.purchase.dishs.length; purchase_t_iter++) {
                    if (results.dishs[all_t_iter]._id.toString()===results.purchase.dishs[purchase_t_iter]._id.toString()) {
                        results.dishs[all_t_iter].checked='true';
                    }
                }
            }
            res.render('purchase_form', { title: 'Изменение заказа', dishs: results.dishs, purchase: results.purchase });
        });
};

exports.purchase_update_get = render_purchase_update_form;


exports.purchase_update_post = [

    (req, res, next) => {
        if(!(req.body.dishes instanceof Array)){
            if(typeof req.body.dishes==='undefined')
            req.body.dishes=[];
            else
            req.body.dishes=new Array(req.body.dishes);
        }
        next();
    },

    body('name', 'Введите Ваше ФИО!').trim().isLength({ min: 1 }).escape(),
    body('purchase_time', 'Введите время, на которое хоите сделать заказ!').trim().isLength({ min: 1 }).escape(),
    body('dishes.*').escape(),

    (req, res, next) => {

        const errors = validationResult(req);

        var purchase = new Purchase(
          { name: req.body.name,
            purchase_time: req.body.purchase_time,
			duration: req.body.duration,
            dishes: (typeof req.body.dishes==='undefined') ? [] : req.body.dishes,
            _id:req.params.id
           });

        if (!errors.isEmpty()) {
            Dish.find({}).exec(function(err, dishes) {
                if (err) { return next(err); }

                for (let i = 0; i < dishes.length; i++) {
                    if (purchase.genre.indexOf(dishes[i]._id) > -1) {
                        dishes.genres[i].checked='true';
                    }
                }
                res.render('purchase_form', { title: 'Изменение заказа', dishes: dishes, purchase: purchase, errors: errors.array() });
            });
            return;
        }
        else {
            Purchase.findByIdAndUpdate(req.params.id, purchase, {}, function (err,thepurchase) {
                if (err) { return next(err); }
                   res.render('purchase_success', { title: 'Заказ изменен!', id: purchase._id});
                });
        }
    }
];

exports.purchases_get = function(req, res, next) {
	Purchase.find({}).exec(function(err, purchases) {
		if(err) { return next(err); }
		res.render('purchase_select', { title: 'Выбор заказа', purchases: purchases })
	});
};

exports.purchases_post = render_purchase_update_form;
