const { body,validationResult } = require('express-validator');
var Purchase = require('../models/purchase');
var Dish = require('../models/dish');

var async = require('async');

exports.purchase_create_get = function(req, res, next) {
	Dish.find({'in_sale': true}).exec(function(err, dishes) {
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
    body('dishes.*').escape(),

    (req, res, next) => {

        const errors = validationResult(req);

        var purchase = new Purchase(
          { name: req.body.name,
            purchase_time: Date.now(),
            dishes: req.body.dishes
           });

        if (!errors.isEmpty()) {
	    Dish.find({'in_sale': true}).exec(function(err, dishes) {
                if (err) { return next(err); }
                for (let i = 0; i < dishes.length; i++) {
                    if (purchase.dishes.indexOf(dishes[i]._id) > -1) {
                        dishes[i].checked=true;
                    }
                }
                res.render('purchase_form', { title: 'Новый заказ', dishes: dishes, purchase: purchase, errors: errors.array() });
            });
            return;
        }
        else {
          Dish.find({}).exec(function(err, dishes){
            for (let i = 0; i < dishes.length; i++) {
                if (purchase.dishes.indexOf(dishes[i]._id) > -1 && !dishes[i].in_sale) {
                    var err = new Error('Похоже, пока Вы делали заказ, все блюдо разобрали:(');
            	    err.status = 409;
            	    return next(err);
                }
            }
            purchase.save(function (err) {
                if (err) { return next(err); }
		res.render('purchase_success', { title: 'Заказ сделан!', purchase: purchase});
            });
            for (let i = 0; i < dishes.length; i++) {
                if (purchase.dishes.indexOf(dishes[i]._id) > -1) {
                    if(--(dishes[i].remains) == 0) {
                        dishes[i].in_sale = false;
                    }
                    Dish.findByIdAndUpdate(dishes[i]._id, dishes[i], {}, function (err) {
                        if (err) { return next(err); }
                    });
                }
              }
          });
        }
    }
];

exports.purchase_detail = function(req, res, next) {

    
    Purchase.findById(req.params.id).populate('dishes').exec(function(err, purchase) {
        if (err) { return next(err); }
        if (purchase==null) {
            var err = new Error('Заказ не найден­!');
            err.status = 404;
            return next(err);
        }
        res.render('purchase_detail', { purchase: purchase } );
    });
};

exports.purchase_delete_get = function(req, res, next) {

    Purchase.findById(req.params.id).populate('dishes').exec(function(err, purchase) {
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
  Purchase.findById(req.body.purchaseid).populate('dishes').exec(function(err, purchase) {
        if (err) { return next(err); }
        for (let i=0; i<purchase.dishes.length; i++) {
            var newDish = new Dish(
                { name: purchase.dishes[i].name,
                  description: purchase.dishes[i].description,
                  price: purchase.dishes[i].price,
                  remains: purchase.dishes[i].remains + 1,
                  in_sale: true,
                  _id: purchase.dishes[i]._id
                });
            Dish.findByIdAndUpdate(purchase.dishes[i]._id, newDish, {}, function (err) {
                if (err) { return next(err); }
            });
        }
        Purchase.findByIdAndRemove(req.body.purchaseid, function deletePurchase(err) {
            if (err) { return next(err); }
                res.redirect('/')
        });
    });
};

exports.purchase_update_get = function(req, res, next) {

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
            for (var all_t_iter = 0; all_t_iter < results.dishes.length; all_t_iter++) {
                for (var purchase_t_iter = 0; purchase_t_iter < results.purchase.dishes.length; purchase_t_iter++) {
                    if (results.dishes[all_t_iter]._id.toString()===results.purchase.dishes[purchase_t_iter]._id.toString()) {
                        results.dishes[all_t_iter].checked=true;
                    }
                }
            }
            res.render('purchase_form', { title: 'Изменение заказа', dishes: results.dishes, purchase: results.purchase });
        });
};

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
    body('dishes.*').escape(),

    (req, res, next) => {

        const errors = validationResult(req);

        var purchase = new Purchase(
          { name: req.body.name,
            purchase_time: req.body.purchase_time,
            dishes: (typeof req.body.dishes==='undefined') ? [] : req.body.dishes,
            _id:req.params.id
           });

        if (!errors.isEmpty()) {
            Dish.find().exec(function(err, dishes) {
                if (err) { return next(err); }

                for (let i = 0; i < dishes.length; i++) {
                    if (purchase.dishes.indexOf(dishes[i]._id) > -1) {
                        dishes[i].checked=true;
                    }
                }
                res.render('purchase_form', { title: 'Изменение заказа', dishes: dishes, purchase: purchase, errors: errors.array() });
            });
            return;
        }
        else {
           Purchase.findById(req.params.id).exec(function(err, former_purchase) {
               if (err) { return next(err); }
               for (let i=0; i<req.body.dishes.length; i++) {
                   if (former_purchase.dishes.indexOf(req.body.dishes[i]) == -1) {
                       Dish.findById(req.body.dishes[i]).exec(function(err, dish){
                           if (!dish.in_sale) {
                               var err = new Error('Похоже, пока Вы делали заказ, все блюдо разобрали:(');
            	               err.status = 409;
            	               return next(err);
                           }
                           var newDish = new Dish(
                           {  name: dish.name,
                              description: dish.description,
                              price: dish.price,
                              remains: dish.remains-1,
                              in_sale: dish.remains-1 > 0,
                              _id: dish._id
                           });
                           Dish.findByIdAndUpdate(dish._id, newDish, {}, function (err) {
                               if (err) { return next(err); }
                           });
                       });
                   }
               }
               for (let i=0; i<former_purchase.dishes.length; i++) {
                   if (req.body.dishes.indexOf(former_purchase.dishes[i].toString()) == -1) {
                       Dish.findById(former_purchase.dishes[i]).exec(function(err, dish){
                           var newDish = new Dish(
                           {  name: dish.name,
                              description: dish.description,
                              price: dish.price,
                              remains: dish.remains+1,
                              in_sale: true,
                              _id: dish._id
                           });
                           Dish.findByIdAndUpdate(dish._id, newDish, {}, function (err) {
                               if (err) { return next(err); }
                           });
                       });
                   }
               }
               Purchase.findByIdAndUpdate(req.params.id, purchase, {}, function (err) {
                   if (err) { return next(err); }
                   res.render('purchase_success', { title: 'Заказ изменен!', purchase: purchase });
               });
           });
        }
    }
];

exports.purchases_get = function(req, res, next) {
    res.render('purchase_select', { title: 'Выбор заказа' });
};

exports.purchases_post = function(req, res, next) {

    Purchase.findById(req.body.id).populate('dishes').exec(function(err, purchase) {
        if (err) { return next(err); }
        if (purchase==null) {
            var err = new Error('Заказ не найден­!');
            err.status = 404;
            return next(err);
        }
        res.render('purchase_detail', { purchase: purchase } );
    });
};
