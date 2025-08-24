import express from 'express'
import cors from 'cors'
//need to have some middleware

const app = express();//just an instace of express app
app.use(express.json());//the middle ware we needed

app.use(cors({
    origin:process.env.CORS_ORIGIN,credentials : true
}))

export default app;