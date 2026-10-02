import express, { Response ,Request} from "express"
import connectionPool from "../config/database"
import { authenticateToken } from "../middleware/authenticationMiddleware"

const router = express.Router()

//Create project using post method
router.post("/", authenticateToken, async (req: Request, res: Response) => {
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

router.get("/", authenticateToken, async (req: Request, res: Response) => {

    try {
        const listProjects = await connectionPool.query(
            "SELECT id,name,description,owner_id,created_at  FROM  projects  "
        )
        res.status(200).json(listProjects.rows)
    }
    catch (error) {
        res.status(500).json({ message: "Something went wrong" })
    }
})

// assign members to the projects 

router.post("/:id/members", authenticateToken, async (req: Request, res: Response) => {
    try {
        const projectid = req.params.id
        const user_to_add = req.body.userId

        //Ensures that a user id is not empty 
        if (!user_to_add) {
            res.status(400).json({ message: "User id is required." })
            return;

        }
        //check if project exists ,if so get its owner
        const projectresult = await connectionPool.query(
            "SELECT owner_id FROM projects WHERE id=$1", [projectid]
        )
        if (projectresult.rows.length === 0) {
            res.status(404).json({ message: "Project not found" })
            return;
        }
        const project = projectresult.rows[0]

        //only the project owner can add members
        if (project.owner_id !== req.user.id) {
            res.status(403).json({ message: "Only project owner can add memebrs." })
            return;
        }
        //check if user exists before being added
        const list_users = await connectionPool.query(
            "SELECT id from users where id=$1", [user_to_add]
        )
        if (list_users.rows.length === 0) {
            res.status(404).json({ message: "User not found" })
            return;
        }
        //check if user is not already member to the project to avoid duplication

        const existing_members = await connectionPool.query(
            "SELECT id FROM project_members WHERE project_id=$1 AND user_id=$2", [projectid, user_to_add]
        )
        if (existing_members.rows.length > 0) {
            res.status(400).json({ message: "User is already member of the project" })
            return;
        }

        //Add user after validation
        const addMember = await connectionPool.query(
            "INSERT INTO project_members(project_id,user_id) VALUES($1,$2) RETURNING id,project_id,user_id", [projectid, user_to_add]
        )
        res.status(201).json(addMember.rows[0])
    }
    catch (error) {
        console.log(error)
        res.status(500).json({ message: "Something went wrong" })
    }
})

router.delete("/:id/members/:userId", authenticateToken, async (req:Request, res: Response) => {
    try {
        const projectId = req.params.id
        const user_id_to_remove = req.params.userId

        //check if the project exists and get its owner
        const projectresults = await connectionPool.query(
            "SELECT owner_id FROM projects WHERE id=$1", [projectId]
        )
        if (projectresults.rows.length === 0) {
            res.status(404).json({ message: "Project is  not found" })
            return;
        }
        const project = projectresults.rows[0]

        //Ensures only the project owner can remove members
        if (project.owner_id !== req.user.id) {
            res.status(403).json({ message: "Only project owner can remove members" })
            return;
        }

        //Check if the memebr exists before removing them 

        const existing_member = await connectionPool.query(
            "SELECT id FROM project_members WHERE project_id=$1 AND user_id=$2", [projectId, user_id_to_remove]
        )
        if (existing_member.rows.length === 0) {
            res.status(404).json({ message: "User is not a member of this project" })
            return;
        }
        //Remove  member
        await connectionPool.query("DELETE FROM project_members WHERE project_id=$1 AND user_id=$2", [projectId, user_id_to_remove])
        res.status(204).send()
    }
    catch (error) {
        console.log(error)
        res.status(500).json({ message: "Something went wrong " })
    }
})

//Listing all submission for a project 

router.get("/:id/submissions", authenticateToken, async (req: Request, res: Response) => {

    try {

        const project_id = req.params.id

        //Check if the project exists 
        const results = await connectionPool.query(
            "SELECT id  FROM projects WHERE id=$1", [project_id]
        )
        if (results.rows.length === 0) {
            res.status(404).json({ message: "No project exists with this id." })
            return;

        }
        //after validating store the results of the lists 
        const submissionList = await connectionPool.query(
            "SELECT * FROM submissions WHERE project_id=$1", [project_id]
        )

        res.status(200).json(submissionList.rows)
    }
    catch (error) {
        console.log(error)
        res.status(500).json({ message: "Something went wrong " })
    }
})

export default router