import express, { Request, Response } from "express"
import bcrypt from "bcrypt"
import connectionPool from "../config/database"
import { authenticateToken } from "../middleware/authenticationMiddleware"

const router = express.Router()
//View profile -read operation 

router.get("/:id", authenticateToken, async (req: Request, res: Response) => {
    try {
        const userid = req.params.id
        const result = await connectionPool.query(
            "SELECT id,name,email,role,profile_picture,created_at FROM users WHERE id=$1", [userid]
        )
        if (result.rows.length === 0) {
            res.status(404).json({ message: "User not found" })
            return;
        }
        res.status(200).json(result.rows[0])
    }
    catch (error) {
        console.log(error)
        res.status(500).json({ message: "Something went wrong" })
        return;
    }
})

// updating user profile

router.put("/:id", authenticateToken, async (req: Request, res: Response) => {
    try {
        const userid = req.params.id

        //Allow only logged in users to edit

        if (req.user.id !== Number(userid)) {
            res.status(403).json({ message: "You can only edit your own profile" })
            return;
        }
        const name = req.body.name
        const email = req.body.email
        const profile_picture = req.body.profile_picture

        if (!name) {
            res.status(400).json({ message: "Name is required" })
            return;
        }
        if (!email) {
            res.status(400).json({ message: "Name is required" })
            return;
        }
        const update_user_profile = await connectionPool.query(
            "UPDATE users SET name=$1,email=$2,profile_picture=$3 WHERE id=$4 RETURNING id,name,email,role,profile_picture,created_at",
            [name, email, profile_picture, userid]
        )
        if (update_user_profile.rows.length === 0) {
            res.status(404).json({ message: "User is not found" })
            return;
        }
        res.status(200).json({ message: "user updated succesfully." })
    }
    catch (error) {
        console.log(error)
        res.status(500).json({ message: "Something went wrong " })
    }
})

//Deleting user profile

router.delete("/:id", authenticateToken, async (req: Request, res: Response) => {
    try {
        const userid = req.params.id

        //Only logged in users can delete their own profile

        if (req.user.id !== Number(userid)) {
            res.status(403).json({ message: "You can only delete your own profile" })
            return;
        }
        const deleteuser = await connectionPool.query(
            "DELETE FROM users WHERE id=$1 RETURNING id", [userid]
        )
        if (deleteuser.rows.length === 0) {
            res.status(404).json({ message: "User not found" })
            return;
        }
        res.status(204).send()
        return;
    }
    catch (error) {
        res.status(500).json({ message: "Something went wrong" })
    }
})

//view user activity feed 

router.get("/:id/notifications",authenticateToken,async(req:Request,res:Response)=>{
    try{
        const id=req.params.id 

        //Only logged in users can view their notifications
        if(req.user.id !==Number(id)){
            res.status(403).json({message:"You can only view yout notifications"})
            return;
        }

        const notifications=await connectionPool.query(
            "SELECT id,message,created_at FROM notifications WHERE user_id=$1",[id]
        )
        res.status(200).json(notifications.rows)
    }
    catch(error){
        console.log(error)
        res.status(500).json({message:"Something went wrong."})
    }
})
export default router