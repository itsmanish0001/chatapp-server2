import express from "express";
import userRoute from "./routes/user.js";
import chatRoute from "./routes/chat.js";
import {connectDB} from "./utils/features.js";
import dotenv from 'dotenv'
import {errorMiddleware} from './middlewares/error.js'
import cookieParser from "cookie-parser";
import { createUser } from "./seeders/user.js";
import { createGroupChats, createMessages, createMessagesInAChat, createSingleChats } from "./seeders/chat.js";
import adminRoute from "./routes/admin.js";
import { getSockets } from "./lib/helper.js";
import {Server} from 'socket.io'
import {createServer} from 'http';
import { NEW_MESSAGE, NEW_MESSAGE_ALERT, START_TYPING, STOP_TYPING, CHAT_JOINED,CHAT_LEAVED, ONLINE_USERS } from "./constants/events.js";
import {v4 as uuid} from 'uuid'
export const userSocketIDs = new Map();
import cors from 'cors'
import {v2 as cloudinary} from 'cloudinary';
import { corsOptions } from "./constants/config.js";
import { socketAuthenticator } from "./middlewares/auth.js";
import { Message } from "./models/message.js";



dotenv.config({
    path: "./.env",
})

 const adminSecretKey = process.env.ADMIN_SECRET_KEY || "MANISHBHARTI"

const mongoURI = process.env.MONGO_URI;
const port = process.env.PORT || 3000;
const envMode = process.env.NODE_ENV.trim() || "PRODUCTION";

const app = express();
const server = createServer(app);
const io = new Server(server, {cors: corsOptions,});
const onlineUsers = new Set();


app.set("io", io);

connectDB(mongoURI);
// createUser(10);
// createSingleChats(10);
// createGroupChats(10);
// createMessages(20);
// createMessagesInAChat("660ffa3091752cb839320229", 100);

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET,
})

app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions))

app.use("/api/v1/user", userRoute);
app.use("/api/v1/chat", chatRoute);
app.use("/api/v1/admin", adminRoute);


app.get("/", (req, resp) => {
    resp.send("hello bhadwe");
})


io.use((socket, next) => {
    cookieParser()(socket.request, socket.request.res, async(err)=>{
       await socketAuthenticator(err, socket, next)
    })
})



io.on("connection", (socket) => {
    
    console.log("a user connected", socket.id);

    const user = socket.user;
    // console.log(socket.user);

    userSocketIDs.set(user._id.toString(), socket.id);
    // console.log(userSocketIDs);

    socket.on(NEW_MESSAGE, async(data)=>{
        const { chatId, members, message } = data;
       
        const messageForRealTime = {
            content:message,
            _id:uuid(),
            sender:{
                _id:user._id,
                name:user.name,

            },
            chat:chatId,
            createdAt: new Date().toISOString(),

        };

        const messageForDB = {
            content:message,
            sender: user._id,
            chat: chatId
        };

        // console.log("Emitting", messageForRealTime);
        console.log("Emitting", members);


        const membersSocket = getSockets(members);
        io.to(membersSocket).emit(NEW_MESSAGE, {
            chatId,
            message:messageForRealTime,

        })

        io.to(membersSocket).emit(NEW_MESSAGE_ALERT, {
            chatId
        })

        try{
            await Message.create(messageForDB)
        }
        catch(err){
           throw new Error(error);
        }

        // console.log("new message", messageForRealTime)
    });

    socket.on(START_TYPING, ({members, chatId})=>{
        console.log("start typing", members, chatId);
        const membersSocket = getSockets(members);

        socket.to(membersSocket).emit(START_TYPING, {chatId});
    })

    socket.on(STOP_TYPING, ({members, chatId}) =>{
        console.log("stop typing", members, chatId);

        const membersSocket = getSockets(members);
        socket.to(membersSocket).emit(STOP_TYPING, {chatId});
    })

    socket.on(CHAT_JOINED, ({ userId, members }) => {
        // console.log("joined" ,userId, members);
        onlineUsers.add(userId.toString());

        const membersSocket = getSockets(members);
        io.to(membersSocket).emit(ONLINE_USERS, Array.from(onlineUsers));
        
      });
    
      socket.on(CHAT_LEAVED, ({ userId, members }) => {
        // console.log( "leaved" ,userId, members);
        onlineUsers.delete(userId.toString());

        const membersSocket = getSockets(members);
    io.to(membersSocket).emit(ONLINE_USERS, Array.from(onlineUsers));
      });
    



    socket.on("disconnect", ()=>{
        console.log("user disconnected");
        userSocketIDs.delete(user._id.toString());
        onlineUsers.delete(user._id.toString());
        socket.broadcast.emit(ONLINE_USERS, Array.from(onlineUsers));
    })
})




app.use(errorMiddleware);




server.listen(port, ()=>{
    console.log(`server is running on port ${port} in ${envMode} mode`);
})


export {envMode, adminSecretKey}