import express from "express"
import dotenv from "dotenv"
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
app.use("/api/submission", submissionRoute)
app.use("/api/comments",commentsRouter)


app.get("/", (request, response) => {
    response.send("Collaborative code review platform")
})
app.listen(port, () => {
    console.log("Server is listening on port ", port)
})

//test the connection returns success or error if it can't connect
testConnection()