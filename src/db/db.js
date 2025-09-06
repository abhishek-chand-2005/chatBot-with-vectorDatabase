const mongoose = require('mongoose');

async function connectdb() {
     const uri = process.env.MONGO_URI;
        // console.log("Mongo URI:", uri); // This should print a proper URI
        if (!uri) {
            throw new Error("MONGO_URI is not defined in environment variables.");
        }
    try{
        await mongoose.connect(uri);
        console.log("Database connected.");
        
    } catch (err){
        console.log("ERROR! CONNECTING TO MONGODB:", err);
    }
    
}

module.exports = connectdb;