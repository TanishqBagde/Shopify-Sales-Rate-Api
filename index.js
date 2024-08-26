const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const routes = require('./routes/routes');

app.use(cors({
    origin: 'https://shopify-rate-tanishq.netlify.app' 
}));

// Connecting to mongoDB
mongoose.connect('mongodb+srv://db_user_read:LdmrVA5EDEv4z3Wr@cluster0.n10ox.mongodb.net/RQ_Analytics', {

});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});


app.use('/api', routes);

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
