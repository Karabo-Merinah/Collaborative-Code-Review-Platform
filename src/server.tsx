import express from "express"
import dotenv from "dotenv"
import { WebSocketServer } from "ws"
import { testConnection } from "./config/database"
import authRoutes from "./routes/auth_route"
import userRoutes from "./routes/userRoutes"
import projectRoutes from "./routes/projectRoutes"
import submissionRoute from "./routes/submissionRoutes"
import commentsRouter from "./routes/commentsRoutes"

dotenv.config()

const app = express()
const port = process.env.PORT

app.use(express.json())
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/projects", projectRoutes)
app.use("/api/submissions", submissionRoute)
app.use("/api/comments", commentsRouter)


app.get("/", (request, response) => {
    response.send("Collaborative code review platform")
})
const httpServer = app.listen(port, () => {
    console.log("Server is listening on port ", port)
})

const web_socket_server = new WebSocketServer({ server: httpServer })

web_socket_server.on("connection", (socket) => {
    console.log("A client is connected to WebSocket")

    socket.on("close", () => {
        console.log("A client disconnected.")
    })
})
//Sends messages to every connected client 
export function sendMessage(message: string) {
    const allClients = Array.from(web_socket_server.clients)
    for (let i = 0; i < allClients.length; i++) {
        const client = allClients[i]

        if (client.readyState === client.OPEN) {
            client.send(message)
        }
    }
}

//test the connection returns success or error if it can't connect
testConnection()