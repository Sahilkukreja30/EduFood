import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import userRoutes from './routes/user.routes.js';
//need to have some middleware

const app = express();//just an instace of express app
app.use(express.json());//the middle ware we needed

app.use(cors({
    origin:process.env.CORS_ORIGIN,credentials : true
}))

app.use(express.json({limit:"16kb"})) //to apply a limit to recieve json request
app.use(express.urlencoded()) //it is used to take data from url and in url in between data there is special characters that's why it is used
app.use(cookieParser())
app.use(express.static('public'))
app.use('/api/v1/user', userRoutes);

export default app;