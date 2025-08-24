import {Router} from "express";
import { loginUser, logOutUser, registerUser } from "../controller/user.controller.js";
import { createOrder, getQueue } from "../controller/order.controller.js";
import { verifyJwt } from "../middlewares/auth.middlewares.js";


const router = Router();
router.route('/register').post(
    registerUser
);
router.route('/login').post(
    loginUser
);
router.route('/order').post(
    createOrder
);
router.route('/queue').get(
    getQueue
);
router.route('/logout').post(
    verifyJwt,
    logOutUser
);


export default router;