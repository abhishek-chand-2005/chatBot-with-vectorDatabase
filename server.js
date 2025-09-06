const app = require('./src/app');
const httpServer = require("http").createServer(app);
const initSocketServer = require("./src/sockets/socket.server")
require("dotenv").config();
const generateResponse = require('./src/service/ai.service')
const connectDB = require('./src/db/db');

connectDB();
initSocketServer(httpServer);


const port = 3000;
httpServer.listen(3000, ()=>{
    console.log(`Server is running on port ${port}`);
})