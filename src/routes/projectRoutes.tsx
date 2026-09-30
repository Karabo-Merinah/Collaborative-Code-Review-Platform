import express, { Response } from "express"
import connectionPool from "../config/database"
import { authenticateToken } from "../middleware/authenticationMiddleware"

const router = express.Router()

//Create project using post method
router.post("/", authenticateToken, async (req: any, res: Response) => {
    try {
        const name = req.body.name
        const description = req.body.description

        //Ensures that fields are filled in
        if (!name) {
            res.status(400).json({ message: "Name is required" })
            return;
        }
        //Makes the logged in user the owner of the project 
        const ownerId = req.user.id

        const newProject = await connectionPool.query(
            "INSERT INTO projects(name,description,owner_id) VALUES($1,$2,$3) RETURNING id,name,description,owner_id,created_at",
            [name, description, ownerId]
        )
        res.status(201).json(newProject.rows[0])
    }
    catch (error) {
        console.log(error)
        res.status(500).json({ message: "Something went wrong" })
    }
})

//Listing projects 

router.get("/", authenticateToken, async (req: any, res: Response) => {

    try {
        const listProjects = await connectionPool.query(
            "SELECT name,description,owner_id,created_at  FROM  projects  "
        )
        res.status(200).json(listProjects.rows)
    }
    catch (error) {
        res.status(500).json({ message: "Something went wrong" })
    }
})

export default router