import dotenv from "dotenv"
import { Pool } from "pg"

dotenv.config()

//Creating connection 
const  connectionPool =new Pool({
    connectionString:process.env.DATABASE_URL
})
export const testConnection=async()=>{
    try{
        const client=await connectionPool.connect()
        console.log("Connected successfully")
        client.release()
    }
    catch(error){
        console.log(error)
    }
}
export default connectionPool;