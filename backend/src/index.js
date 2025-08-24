import app from "./app.js";
import { connectDb } from "./db/connectDb.js";

connectDb()
.then(()=>{
    app.get("/",(req,res)=>{
        res.send("Server is up and running");
    })
    app.listen(process.env.PORT,()=>{
        console.log(`Server is running on port ${process.env.PORT}`);
    })
})
.catch((err)=>{
    console.log("Error connecting to in indexjs",err);
})