const { Server } = require("socket.io");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model")
const aiService = require("../service/ai.service")
const messageModel = require("../models/message.model")
const {createMemory, queryMemory} = require('../service/vector.service')

function initSocketServer(httpServer){

    const io = new Server(httpServer, {})

    io.use(async(socket, next)=>{
        const cookies = cookie.parse(socket.handshake.headers?.cookie || "");

        if(!cookies.token){
            next(new Error("Authentication error: No token provided"))
        }

        try{
            const decoded = jwt.verify(cookies.token, process.env.JWT_SECRET);
            const user = await userModel.findById(decoded.id);
            socket.user = user
            next();
        }catch(err){
            next(new Error("Authentication error: Invalid token"))
        }

        console.log("Socket connection cookies:", cookies)
    })

    io.on("connection", (socket) => {


        socket.on("ai-message", async (messagePayload) => {
        try {
            console.log("Message from client:", messagePayload);

               if (!messagePayload.content || typeof messagePayload.content !== "string") {
                throw new Error("Invalid message payload: 'content' is required and must be a string");
    }

    /* MessagePayLoad = { chat : chatId, content: message text} */

            const message = await messageModel.create({
                chat: messagePayload.chat,
                user: socket.user._id,
                content: messagePayload.content,
                role: "user"
            })

            const vector = await aiService.generateVector(messagePayload.content);

            const memory = await queryMemory({
                queryVector: vector, 
                limit: 3,
                metadata: {}
            })

            await createMemory({
                vectors: vector,   // ✅ match hona chahiye
                messageId: message._id,
                metadata:{
                    chat: messagePayload.chat,
                    user: socket.user._id,
                    text: messagePayload.content   // ✅ add text metadata
                }
            })


            const chatHistory = (await messageModel.find({
                chat: messagePayload.chat
            }).sort({ createdAt: -1}).limit(4).lean()).reverse();

            const stm = chatHistory.map(item => ({
                role: item.role,
                parts: [{ text: item.content }]
            }));

            const longtm = [{
                role: "model",
                parts: [{
                    text: `these are some of the previous conversations you had that are relevant to the current topic: ${memory.map(item => item.metadata.text).join("\n")}`
                }]
            }];

            [...longtm, ...stm].forEach(i => console.log(i));

            const response = await aiService.generateResponse([...longtm, ...stm]);

            const responseMessage = await messageModel.create({
                chat: messagePayload.chat,
                user: socket.user._id,
                content: response,
                role: "model"
            })

            const responseVectors = await aiService.generateVector(response);

            await createMemory({
                vectors: responseVectors,
                messageId: responseMessage._id,
                metadata:{
                    chat: messagePayload.chat,
                    user: socket.user._id,
                    text: response   // ✅ add text metadata
                }
            })

            socket.emit("ai-response", {
                content: response,
                chat: messagePayload.chat,
            });
        } catch (err) {
                console.error("AI service error:", err.message);
                socket.emit("ai-response", {
                    content: "Sorry, I couldn't process that message.",
                    chat: messagePayload.chat,
                });
            }
        });


    })
}

module.exports = initSocketServer;