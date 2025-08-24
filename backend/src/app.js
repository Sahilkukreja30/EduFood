import express from 'express'
import cors from 'cors'
import userRoutes from './routes/user.routes.js';
//need to have some middleware

const app = express();//just an instace of express app
app.use(express.json());//the middle ware we needed

app.use(cors({
    origin:process.env.CORS_ORIGIN,credentials : true
}))


app.use('/api/v1/user', userRoutes);

export default app;