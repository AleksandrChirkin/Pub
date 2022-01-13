var express = require('express');
var router = express.Router();

var index_controller = require('../controllers/indexController');
var dish_controller = require('../controllers/dishController');
var purchase_controller = require('../controllers/purchaseController');
var table_controller = require('../controllers/tableController');
var order_controller = require('../controllers/orderController');

router.get('/', index_controller.index);

router.get('/dish/:id', dish_controller.dish_detail);
router.get('/dishes', dish_controller.dishes_list);

router.get('/purchase/create', purchase_controller.purchase_create_get);
router.post('/purchase/create', purchase_controller.purchase_create_post);
router.get('/purchase/:id', purchase_controller.purchase_detail);
router.get('/purchase/:id/delete', purchase_controller.purchase_delete_get);
router.post('/purchase/:id/delete', purchase_controller.purchase_delete_post);
router.get('/purchase/:id/update', purchase_controller.purchase_update_get);
router.post('/purchase/:id/update', purchase_controller.purchase_update_post);
router.get('/purchases', purchase_controller.purchases_get);
router.post('/purchases', purchase_controller.purchases_post);

router.get('/order/create', order_controller.order_create_get);
router.post('/order/create', order_controller.order_create_post);
router.get('/order/:id', order_controller.order_detail);
router.get('/order/:id/delete', order_controller.order_delete_get);
router.post('/order/:id/delete', order_controller.order_delete_post);
router.get('/order/:id/update', order_controller.order_update_get);
router.post('/order/:id/update', order_controller.order_update_post);
router.get('/orders', order_controller.orders_get);
router.post('/orders', order_controller.orders_post);

router.get('/tables', table_controller.table_list);
router.get('/table/:id', table_controller.table_detail);

module.exports = router;
