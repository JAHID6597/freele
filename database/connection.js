const mongoose = require('mongoose');
const connectDB = async () => {
    mongoose
        .connect(process.env.MONGODB_URI, {
            useCreateIndex: true,
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false
        })
        .then(() => console.log('Successfully Connected MONGODB'))
        .catch(() => console.log('Could Not Connected MONGODB'));
}
module.exports = connectDB;