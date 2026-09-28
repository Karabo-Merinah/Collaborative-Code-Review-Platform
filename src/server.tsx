import express from "express";
import dotenv from "dotenv"
import {testConnection} from "./config/database";
dotenv.config()

const app=express()
const port =process.env.PORT

app.use(express.json())

app.get("/",(request,response)=>{
    response.send("Collaborative code review platform")
})
app.listen(port,()=>{
    console.log("Server is listening on port ",port)
})

//test the connection returns success or error if it can't connect
testConnection()