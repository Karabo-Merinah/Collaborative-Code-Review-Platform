import express, { Response } from "express"
import connectionPool from "../config/database"
import { authenticateToken } from "../middleware/authenticationMiddleware"

const router = express.Router()

//Creating submission
router.post("/", authenticateToken, async (req: any, res: Response) => {
    try {
        const project_id = req.body.projectId
        const code_content = req.body.codeContent

        //Makes the fields are required

        if (!project_id) {
            res.status(400).json({ message: "Project id is required" })
            return;
        }

        if (!code_content) {
            res.status(400).json({ message: "Code content is required" })
            return;
        }

        //Check if the project exists 
        const project_results = await connectionPool.query(
            "SELECT id FROM projects WHERE id=$1", [project_id]
        )
        if (project_results.rows.length === 0) {
            res.status(400).json({ message: "Project is not found" })
            return;
        }

        //  Makes the logged in user becomes submitter

        const submitter = req.user.id

        const createSubmission = await connectionPool.query(
            "INSERT INTO submissions (project_id,submitted_by,code_content) VALUES($1,$2,$3) RETURNING id,project_id,submitted_by,code_content,status,created_at",
            [project_id, submitter, code_content]
        )
        res.status(201).json(createSubmission.rows[0])

    }
    catch (error) {
        console.log(error)
        res.status(500).json({ message: "Something went wrong" })
    }
})



//Viewing a specific submission by providing id 

router.get("/:id", authenticateToken, async (req: any, res: Response) => {

    try {
        //receive submission id 

        const submission_id = req.params.id

        //checks if the id it is a number

        if (!Number(submission_id)) {
            res.status(400).json({ message: "Submission id must be a number" })
            return;
        }

        //Checks if there's any submissions with that id 

        const submission_results = await connectionPool.query(
            "SELECT * FROM submissions WHERE id=$1", [submission_id]
        )

        //checks the length of the results if it zero there is no submission with that id 

        if (submission_results.rows.length === 0) {
            res.status(404).json({ message: "No results found for this id " })
            return;
        }
        //show success  results 
        res.status(200).json(submission_results.rows[0])

    }
    catch (error) {
        console.log(error)
        res.status(500).json({ message: "Something went wrong " })
    }
})

//Updating  submission status 

router.patch("/:id/status", authenticateToken, async (req: any, res: Response) => {

    try {
        const submission_id = req.params.id
        const updateStatus = req.body.status
        //Specify the  allowed values for status 
        const statuses = ["pending", "in_review", "approved", "changes_requested"]

        if (!updateStatus || !statuses.includes(updateStatus)) {
            res.status(400).json({ message: "Status is required and must be either :pending,in_review,approved,changes_requested" })
            return;
        }
        const updatedStatus = await connectionPool.query(
            "UPDATE submissions SET status=$1 WHERE id=$2 RETURNING id,project_id ,submitted_by,code_content, status ", [updateStatus, submission_id]
        )
        if (updatedStatus.rows.length === 0) {
            res.status(404).json({ message: "No submission with id exists" })
            return;
        }

        res.status(200).json(updatedStatus.rows[0])

    }
    catch (error) {
        console.log(error)
        res.status(500).json({ message: "Something went wrong " })
    }
})

//deleting submission

router.delete("/:id", authenticateToken, async (req: any, res: Response) => {

    try {

        const id_to_delete = req.params.id

        //check if it is a number
        if (!Number(id_to_delete)) {
            res.status(400).json({ message: "Submission id must be a number" })
            return;
        }

        const delete_results = await connectionPool.query(
            "DELETE FROM submissions WHERE id=$1 RETURNING id", [id_to_delete]
        )
        //check if id exists
        if (delete_results.rows.length === 0) {
            res.status(404).json({ message: "Submission id is not found" })
            return;
        }
        res.status(204).send()
    }
    catch (error) {
        console.log(error)
        res.status(500).json({ message: "Something went wrong" })
    }
})

export default router
