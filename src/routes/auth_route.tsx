import express from "express";
import bcrypt from "bcrypt";
import connectionPool from "../config/database";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { allowReviewer, allowSubmitters, authenticateToken } from "../middleware/authenticationMiddleware";
import { validateFields } from "../middleware/validationMiddleware";

const router = express.Router()

router.post("/register",validateFields(["name","email","password","role"]), async (req: Request, res: Response) => {
    try {
        const name = req.body.name
        const email = req.body.email
        const password = req.body.password
        const role = req.body.role
      
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
        res.status(500).json({ message: "Something went wrong" })
    }
})

router.post("/login",validateFields(["email","password"]), async (req: Request, res: Response) => {
    try {
        const email = req.body.email
        const password = req.body.password

        //Find user by email 

        const result = await connectionPool.query(
            "SELECT id,name,email,role,password_hash FROM users WHERE email=$1", [email]
        )
        // if no result is returned throw an error
        if (result.rows.length === 0) {
            res.status(401).json({ message: "Invalid email or password" })
            return;
        }
        const user = result.rows[0]

        //compare the typed password with the stored hashed password
        const isMatch = await bcrypt.compare(password, user.password_hash)

        if (!isMatch) {
            res.status(401).json({ message: "Invalid email or password" })
            return;
        }
        //Retrieve the jwt code fro .env file
        const secret_code = process.env.JWT_CODE

        //check if there's no secrete code 

        if (!secret_code) {
            console.log("JWT secrete code is missing")
            res.status(500).json({ message: "Something went wrong" })
            return
        }

        //Create the token 
        const token = jwt.sign({ id: user.id, role: user.role }, secret_code, { expiresIn: "1h" })

        res.status(200).json({
            user: { id: user.id, name: user.name, email: user.email, role: user.role }, token
        })
    }
    catch (error) {
        console.log(error)
        res.status(500).json({ message: "Something went wrong" })
    }
})

router.get("/me", authenticateToken, (req: Request, res: Response) => {
    res.status(200).json({ message: "You are logged in ", user: (req as any).use })
})

router.get("/reviewer", authenticateToken, allowReviewer, (req: Request, res: Response) => {
    res.status(200).json({ message: "You are verified as a reviewer" })
})

router.get("/submitter", authenticateToken, allowSubmitters, (req: Request, res: Response) => {
    res.status(200).json({ message: "You are verified as a submitter" })
})
export default router