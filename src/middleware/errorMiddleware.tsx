import { Request,Response,NextFunction } from "express";


export function errorHandler(error:any,req:Request,res:Response){
    console.log(error)
    res.status(500).json({message:"Something went wrong "})
}