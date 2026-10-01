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

//Viewing a specific submission by providing id 

router.get("/:id",authenticateToken,async(req:any,res:Response)=>{

    try{
     //receive submission id 

     const submission_id=req.params.id 

     //checks if the id it is a number

     if(!Number(submission_id)){
        res.status(400).json({message:"Submission id must be a number"})
        return;
     }
    
     //Checks if there's any submissions with that id 

     const submission_results=await connectionPool.query(
        "SELECT * FROM submissions WHERE id=$1",[submission_id]
     )

     //checks the length of the results if it zero there is no submission with that id 

     if(submission_results.rows.length===0){
        res.status(404).json({message:"No results found for this id "})
        return;
     }
     //show success  results 
     res.status(200).json(submission_results.rows[0])

    }
    catch(error){
        console.log(error)
        res.status(500).json({message:"Something went wrong "})
    }
})

export default router
