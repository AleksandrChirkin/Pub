var express = require('express');
var router = express.Router();

var order_controller = require('../controllers/orderController');
var table_controller = require('../controllers/tableController');

router.get('/order/create', order_controller.order_create_get);
router.post('/order/create', order_controller.order_create_post);
router.get('/order/:id/delete', order_controller.order_delete_get);
router.post('/order/:id/delete', order_controller.order_delete_post);
router.get('/order/:id/update', order_controller.order_update_get);
router.post('/order/:id/update', order_controller.order_update_post);
router.get('/orders', order_controller.orders_get);
router.post('/orders', order_controller.orders_post);

router.get('', table_controller.index);
router.get('/tables', table_controller.table_list);
router.get('/table/:id', table_controller.table_detail);

module.exports = router;
