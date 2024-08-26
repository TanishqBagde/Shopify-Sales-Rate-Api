const mongoose = require('mongoose');

// Total Sales Over Time
const getTotalSalesOverTime = async (req, res) => {
    const { timeFrame } = req.query; // Retrieve time frame from query parameters

    // Giving the date format based on the time frame
    let dateFormat;
    switch (timeFrame) {
        case 'daily':
            dateFormat = '%Y-%m-%d';
            break;
        case 'monthly':
            dateFormat = '%Y-%m';
            break;
        case 'yearly':
            dateFormat = '%Y';
            break;
        default:
            dateFormat = '%Y-%m'; // Default to monthly
    }

    try {
        const totalSalesOverTime = await mongoose.connection.db.collection('shopifyOrders').aggregate([
            {
                '$project': {
                    'created_at_date': {
                        '$dateFromString': {
                            'dateString': '$created_at',
                            'onError': null,
                            'onNull': null
                        }
                    },
                    'total_sales': {
                        '$convert': {
                            'input': '$total_price_set.shop_money.amount',
                            'to': 'double',
                            'onError': 0,
                            'onNull': 0
                        }
                    }
                }
            },
            {
                '$group': {
                    '_id': { '$dateToString': { 'format': dateFormat, 'date': '$created_at_date' } },
                    'total_sales': { '$sum': '$total_sales' }
                }
            },
            {
                '$sort': { '_id': 1 }
            }
        ]).toArray();

        res.json(totalSalesOverTime);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



// Sales Growth Rate Over Time
const getSalesGrowthRate = async (req, res) => {
    const { timeFrame } = req.query; // Retrieve time frame from query parameters

    // Define the date format based on the time frame
    let dateFormat;
    switch (timeFrame) {
        case 'daily':
            dateFormat = '%Y-%m-%d';
            break;
        case 'monthly':
            dateFormat = '%Y-%m';
            break;
        case 'yearly':
            dateFormat = '%Y';
            break;
        default:
            dateFormat = '%Y-%m'; // Default to monthly
    }

    try {
        const salesGrowth = await mongoose.connection.db.collection('shopifyOrders').aggregate([
            {
                '$project': {
                    'created_at_date': {
                        '$dateFromString': {
                            'dateString': '$created_at',
                            'onError': null,
                            'onNull': null
                        }
                    },
                    'total_sales': {
                        '$convert': {
                            'input': '$total_price_set.shop_money.amount',
                            'to': 'double',
                            'onError': 0,
                            'onNull': 0
                        }
                    }
                }
            },
            {
                '$group': {
                    '_id': { '$dateToString': { 'format': dateFormat, 'date': '$created_at_date' } },
                    'total_sales': { '$sum': '$total_sales' }
                }
            },
            {
                '$sort': { '_id': 1 }
            },
            {
                '$setWindowFields': {
                    'partitionBy': null,
                    'sortBy': { '_id': 1 },
                    'output': {
                        'prevSales': {
                            '$shift': {
                                'output': '$total_sales',
                                'by': -1
                            }
                        }
                    }
                }
            },
            {
                '$addFields': {
                    'growth_rate': {
                        '$cond': {
                            'if': { '$and': [{ '$ne': ['$prevSales', null] }, { '$gt': ['$prevSales', 0] }] },
                            'then': {
                                '$multiply': [
                                    { '$divide': [{ '$subtract': ['$total_sales', '$prevSales'] }, '$prevSales'] },
                                    100
                                ]
                            },
                            'else': 0
                        }
                    }
                }
            }
        ]).toArray();

        res.json(salesGrowth);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



// New Customers Added Over Time
const getNewCustomersAddedOverTime = async (req, res) => {
    const { timeFrame } = req.query; // Retrieve time frame from query parameters

    // Define the date format based on the time frame
    let dateFormat;
    switch (timeFrame) {
        case 'daily':
            dateFormat = '%Y-%m-%d';
            break;
        case 'monthly':
            dateFormat = '%Y-%m';
            break;
        case 'yearly':
            dateFormat = '%Y';
            break;
        default:
            dateFormat = '%Y-%m'; // Default to monthly
    }

    try {
        const newCustomers = await mongoose.connection.db.collection('shopifyCustomers').aggregate([
            {
                '$addFields': {
                    'created_at_date': {
                        '$dateFromString': {
                            'dateString': '$created_at'
                        }
                    }
                }
            },
            {
                '$group': {
                    '_id': { '$dateToString': { 'format': dateFormat, 'date': '$created_at_date' } },
                    'new_customers': { '$sum': 1 }
                }
            },
            {
                '$sort': { '_id': 1 }
            }
        ]).toArray();
        res.json(newCustomers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Number of Repeat Customers
const getRepeatCustomers = async (req, res) => {
    const { timeFrame } = req.query; // Retrieve the time frame from the query parameters

    // Define the date format based on the time frame
    let dateFormat;
    switch (timeFrame) {
        case 'daily':
            dateFormat = '%Y-%m-%d';
            break;
        case 'monthly':
            dateFormat = '%Y-%m';
            break;
        case 'quarterly':
            dateFormat = '%Y-Q%q'; // Note: MongoDB does not directly support quarters in date strings; you might need custom logic
            break;
        case 'yearly':
            dateFormat = '%Y';
            break;
        default:
            dateFormat = '%Y-%m'; // Default to monthly
    }

    try {
        const repeatCustomersOverTime = await mongoose.connection.db.collection('shopifyOrders').aggregate([
            {
                '$group': {
                    '_id': '$customer.id',
                    'order_count': { '$sum': 1 },
                    'last_order_date': { '$max': '$created_at' }
                }
            },
            {
                '$match': {
                    'order_count': { '$gt': 1 }
                }
            },
            {
                '$project': {
                    'created_at_date': {
                        '$dateFromString': {
                            'dateString': '$last_order_date',
                            'onError': null,
                            'onNull': null
                        }
                    }
                }
            },
            {
                '$group': {
                    '_id': { '$dateToString': { 'format': dateFormat, 'date': '$created_at_date' } },
                    'repeat_customers': { '$sum': 1 }
                }
            },
            {
                '$sort': { '_id': 1 }
            }
        ]).toArray();

        res.json(repeatCustomersOverTime);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



// Geographical Distribution of Customers
const getGeographicalDistribution = async (req, res) => {
    try {
        const { timeFrame } = req.query;
        let dateFormat;

        // Determine the date format based on the time frame
        switch (timeFrame) {
            case 'daily':
                dateFormat = '%Y-%m-%d';
                break;
            case 'monthly':
                dateFormat = '%Y-%m';
                break;
            case 'yearly':
                dateFormat = '%Y';
                break;
            default:
                dateFormat = '%Y-%m'; // Default to monthly if invalid time frame
        }

        // Aggregation pipeline to handle the date formatting based on the time frame
        const geoDistribution = await mongoose.connection.db.collection('shopifyCustomers').aggregate([
            {
                '$project': {
                    'city': '$default_address.city',
                    'created_at': {
                        '$dateFromString': { 'dateString': '$created_at' }
                    }
                }
            },
            {
                '$group': {
                    '_id': {
                        'city': '$city',
                        'timeFrame': {
                            '$dateToString': { 'format': dateFormat, 'date': '$created_at' }
                        }
                    },
                    'customer_count': { '$sum': 1 }
                }
            },
            {
                '$group': {
                    '_id': '$_id.city',
                    'data': {
                        '$push': {
                            'timeFrame': '$_id.timeFrame',
                            'customer_count': '$customer_count'
                        }
                    }
                }
            },
            {
                '$sort': { 'customer_count': -1 }
            }
        ]).toArray();

        res.json(geoDistribution);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};




// Customer Lifetime Value 
const getCustomerLifetimeValueBy  = async (req, res) => {
    try {
        const { timeFrame } = req.query;
        let format;

        // Determine the date format based on the time frame
        switch (timeFrame) {
            case 'daily':
                format = '%Y-%m-%d';
                break;
            case 'monthly':
                format = '%Y-%m';
                break;
            case 'yearly':
                format = '%Y';
                break;
            default:
                format = '%Y-%m'; // Default to monthly if invalid time frame
        }

        const customerLifetimeValue = await mongoose.connection.db.collection('shopifyOrders').aggregate([
            {
                '$group': {
                    '_id': '$customer.id',
                    'total_spent': {
                        '$sum': {
                            '$convert': {
                                'input': '$total_price_set.shop_money.amount',
                                'to': 'double',
                                'onError': 0,
                                'onNull': 0
                            }
                        }
                    },
                    'first_order_date': { '$min': '$created_at' }
                }
            },
            {
                '$group': {
                    '_id': { '$dateToString': { 'format': format, 'date': { '$dateFromString': { 'dateString': '$first_order_date' } } } },
                    'avg_lifetime_value': { '$avg': '$total_spent' }
                }
            },
            {
                '$sort': { '_id': 1 }
            }
        ]).toArray();

        res.json(customerLifetimeValue);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};




module.exports = {
    getTotalSalesOverTime,
    getSalesGrowthRate,
    getNewCustomersAddedOverTime,
    getRepeatCustomers,
    getGeographicalDistribution,
    getCustomerLifetimeValueBy 
};
