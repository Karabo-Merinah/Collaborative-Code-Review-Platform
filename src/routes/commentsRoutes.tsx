import express,{ Response,Request } from "express";
import { authenticateToken } from "../middleware/authenticationMiddleware";
import connectionPool from "../config/database";

const router=express.Router()

//updating comment 
router.patch("/:id",authenticateToken,async(req:Request,res:Response)=>{

    try{
        
        const id=req.params.id 
        const new_comment=req.body.content
       
        //check if comment id is a number 
        if(!Number(id)){
         res.status(400).json({message:"Comment id must be a number"})
         return;   
        }
        //ensure that the updated comment is not empty 

        if(!new_comment){
            res.status(400).json({message:"Comment content is required."})
            return;
        }
        if(req.user.role !=="reviewer"){
            res.status(403).json({message:"Only reviewer can update the comment "})
            return;
        
        }
        const updated_comment=await connectionPool.query(
            "UPDATE comments SET content=$1 WHERE id=$2 RETURNING id,submission_id,content",[new_comment,id]
        )

        //checks if there's a comment with the specified  id 
        if(updated_comment.rows.length===0){
            res.status(404).json({message:"No comment with this id "})
            return;
        }
        res.status(200).json(updated_comment.rows[0])
    }
    catch(error){
        console.log(error)
        res.status(500).json({message:"Something went wrong "})
    }
})

//deleting comment of a given id 

router.delete("/:id",authenticateToken,async(req:Request,res:Response)=>{

    try{
        const id=req.params.id 

        // check if the id is a number
        if(!Number(id)){
            res.status(400).json({message:"Comment id must be a number"})
            return;
        }

        const delete_res=await connectionPool.query(
            "DELETE FROM comments WHERE id=$1 RETURNING id",[id]
        )
        //check if id exists 

        if(delete_res.rows.length===0){
            res.status(404).json({message:"Comment with this id is not found"})
            return;
        }
        res.status(204).send()
    }
    catch(error){
        console.log(error)
        res.status(500).json({message:"Something went wrong."})
    }
})

export default router