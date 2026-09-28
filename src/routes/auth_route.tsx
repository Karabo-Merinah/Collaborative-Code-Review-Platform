import express from "express";
import bcrypt from "bcrypt"
import connectionPool from "../config/database";
import { Request, Response } from "express";

const router = express.Router()

router.post("/register", async (req: Request, res: Response) => {
    try {
        const name = req.body.name
        const email = req.body.email
        const password = req.body.password
        const role = req.body.role

        //Ensures that fields are not empty 

        if (!name) {
            res.status(400).json({ message: "Name is required" })
            return;
        }
        if (!email) {
            res.status(400).json({ message: "Email is required" })
            return;
        }
        if (!password) {
            res.status(400).json({ message: "Password is required" })
            return;
        }
        //Limits the role to 2 values and throw error if the values are not met .
        if (role !== "reviewer" && role !== "submitter") {
            res.status(400).json({ message: "Role can be either reviewer or submitter." })
            return;
        }
        // checks if the user email already exists 
        const existingEmail = await connectionPool.query(
            "SELECT id  FROM users  WHERE email =$1", [email]
        )
        if (existingEmail.rows.length > 0) {
            res.status(400).json({ message: "User with this email  already exist " })
            return;
        }
        //hashing password to encrypt before encrypting
        const hashPassword = await bcrypt.hash(password, 10)

        //Save the user
        const newUser = await connectionPool.query(
            "INSERT INTO users (name,email,password_hash,role) VALUES($1,$2,$3,$4)  RETURNING id,name,email,role,created_at",
            [name, email, hashPassword, role]
        )
        res.status(201).json(newUser.rows[0])
        return;
    }
    catch (error) {
        console.log(error)
        res.status(500).json({ message: "" })
    }
})

export default router