const userModel = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

async function registerUser(req, res) {

    const {fullName:{firstName, lastName}, email, password} = req.body;

    const isUserAlreadyExists = await userModel.findOne({ email })
    
    if(isUserAlreadyExists){
        res.status(400).json({ message: "User already Exists"});
    }

    const hashPassword = await bcrypt.hash(password, 10)
    const user = await userModel.create({
        fullName: {
            firstName, lastName
        },
        email,
        password: hashPassword
    })

    const token = jwt.sign({ id: user._id}, process.env.JWT_SECRET);
    res.cookie("token", token, {
        httpOnly: true,   // 🔐 cannot be accessed by JS
        secure: false,    // set true if using HTTPS
        sameSite: "none",  // or "none" if frontend/backend are on different domains
        maxAge: 24 * 60 * 60 * 1000 // 1 day
        });


    res.status(201).json({
        message: "User registered successfully",
        user:{
            email: user.email,
            _id: user._id,
            fullName:user.fullName
        }
    })
}

async function loginUser(req, res) {
    const {email, password} = req.body;

    const user = await userModel.findOne({
        email
    });

    if(!user){
        return res.status(400).json({
            message:"Invalid email or password."
        });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if(!isPasswordValid){
        return res.status(400).json({
            message: "Invalid email or password"
        })
    }

    const token = jwt.sign({id: user._id}, process.env.JWT_SECRET);
    console.log("Setting cookie...");
    res.cookie("token", token, {
        httpOnly: true,   // 🔐 cannot be accessed by JS
        secure: false,    // set true if using HTTPS
        sameSite: "none",  // or "none" if frontend/backend are on different domains
        maxAge: 24 * 60 * 60 * 1000 // 1 day
        });


    res.status(200).json({
        message:"user logged in successfully",
        user:{
            email: user.email,
            _id: user._id,
            fullName: user.fullName
        }
    })
    
}

module.exports = {
    registerUser,
    loginUser
}