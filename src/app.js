const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');

/* Routes */
const authRoutes = require('./routes/auth.routes')
const chatRoutes = require('./routes/chat.routes')


const app = express();



/* Using Middleware */
app.use(cors({
  origin: "http://localhost:5173", // or whatever your React dev server runs on
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

/* Using Routes */
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes)



module.exports = app;