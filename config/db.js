const mongoose = require('mongoose');

const connectDB = async () => {

    try{
        mongoose.set('strictQuery', false);
        const connect = await mongoose.connect(process.env.MONGODB_URL);
        console.log(`Database connection established: ${connect.connection.host}`);
    } catch(err){
        console.log(err);
    }
}

module.exports = connectDB;