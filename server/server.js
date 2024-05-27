import express from "express";
import { Server } from 'socket.io'
import {createServer} from 'http'
import cors from 'cors'
import { measureMemory } from "vm";
const app=express();
const server= createServer(app)

const io = new Server(server,{
    cors:{
        origin:"*",
        methods:['GET','POST'],
        credentials:true,
    }
})  ;
app.use(cors());
io.on( "connection", ( socket ) => {
    console.log("a user connected");
    console.log(socket.id);
    socket.on("new_msg",({message,room})=>{
        console.log({message:message,room:room})
        io.to(room).emit("msg-received",message);
    })

    socket.on("join_room",(msg)=>{ 
        socket.join(msg);
        console.log("room joined")
    })
});
    
app.get('/',(req,res)=>{
    res.send('hello world')
})
      

server.listen(3001,()=>{
    console.log("server is running at port 3001")
});