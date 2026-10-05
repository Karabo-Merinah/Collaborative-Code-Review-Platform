import { Request,Response,NextFunction } from "express";

//checks if the given field exists in the request body

export function validateFields(requiredFields:string[]){
    return(req:Request,res:Response,next:NextFunction)=>{
        const missingFields:string[]=[]

        for(let i=0;i<requiredFields.length;i++){
            const field=requiredFields[i]
            if(!req.body[field]){
                missingFields.push(field)
            }
        }
        if(missingFields.length>0){
            res.status(400).json({message:"Missing required fields" +missingFields.join(",")})
            return;
        }
        next()
    }
}