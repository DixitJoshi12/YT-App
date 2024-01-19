import { registerUser , loginUser , logOutUser} from "../controllers/user.controller.js";
import { Router } from "express";
import {upload} from "../middlewares/multer.middleware.js";
import { jwtValidator } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name : "avatar",
            maxCount : 1
        },
        {
            name : "coverImage",
            maxCount : 1
        }
    ]),
    registerUser);

    router.route("/login").post(loginUser);
    router.route("/logout").post(jwtValidator,logOutUser);

export default router;


