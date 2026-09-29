import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken"

export function authenticateToken(req: any, res: Response, next: NextFunction) {
    const authenticateHeader = req.headers.authorization

    if (!authenticateHeader) {
        res.status(401).json({ message: "No token provided" })
        return;
    }

    //Split the header in  parts to check for format

    const header_parts = authenticateHeader.split(" ")

    //confirms if part has "Bearer"

    if (header_parts.length !== 2 || header_parts[0] !== "Bearer") {
        res.status(401).json({ message: "Token format must be : Bearer<token>" })
        return;
    }

    const token = header_parts[1]

    const jwt_url = process.env.JWT_CODE

    if (!jwt_url) {
        console.log("JWT  code is missing ")
        res.status(500).json({ message: "Something went wrong" })
        return;
    }

    //check if the token exist and is not yet expired

    try {
        const decoded = jwt.verify(token, jwt_url) as any

        //Saves user info 
        req.user = { id: decoded.id, role: decoded.role }

        //when the request is finished move to the next one 
        next()
    }
    catch (error) {
        res.status(401).json({ message: "Invalid or expired token" })
    }

}
export function allowReviewer(req: any, res: Response, next: NextFunction) {
    if (!req.user) {
        res.status(401).json({ message: "You have to be logged in first" })
    }
    if (req.user.role !== "reviewer") {
        res.status(403).json({ message: "This is only permitted for reviewers" })
    }
    next()
}

export function allowSubmitters(req: any, res: Response, next: NextFunction) {
    if (!req.user) {
        res.status(401).json({ message: "You have to be logged in first" })
    }
    if (req.user.role !== "submitter") {
        res.status(403).json({ message: "This is only permitted for submitters" })
    }
    next()
}


