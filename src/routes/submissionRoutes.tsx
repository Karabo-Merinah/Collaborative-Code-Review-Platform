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
            "INSERT INTO submissions (project_id,submitted_by,code_content) VALUES($1,$2,$3,$4) RETURNING id,project_id,submitted_by,code_content,status,created_at",
            [project_id, submitter, code_content]
        )
        res.status(201).json(createSubmission.rows[0])

    }
    catch (error) {
        console.log(error)
        res.status(500).json({ message: "Something went wrong" })
    }
})

//Listing all submission for a project 

router.post("/:id/submissions",authenticateToken,async(req:any,res:Response)=>{
   
    try{

        const project_id=req.params.id 

        //Check if the project exists 
        const results=await connectionPool.query(
            "SELECT id  FROM projects WHERE id=$1",[project_id]
        )
        if(results.rows.length===0){
            res.status(404).json({message:"No project exists with this id."})
            return;

        }
        //after validating store the results of the lists 
        const submissionList=await connectionPool.query(
            "SELECT * FROM submission WHERE project_id=$1",[project_id]
        )

       res.status(200).json(submissionList.rows)
    }
    catch(error){
        console.log(error)
        res.status(500).json({message:"Something went wrong "})
    }
})


export default router
