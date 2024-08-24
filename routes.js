const express = require('express');
const router = express.Router();

const controllers = require('./controllers');

router.get('/sales-over-time', controllers.getTotalSalesOverTime);
router.get('/sales-growth-rate', controllers.getSalesGrowthRate);
router.get('/new-customers-over-time', controllers.getNewCustomersAddedOverTime);
router.get('/repeat-customers', controllers.getRepeatCustomers);
router.get('/geographical-distribution', controllers.getGeographicalDistribution);
router.get('/customer-lifetime-value', controllers.getCustomerLifetimeValueBy );

module.exports = router;
