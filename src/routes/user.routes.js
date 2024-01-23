import { registerUser , loginUser , logOutUser, refreshAccessToken} from "../controllers/user.controller.js";
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

    //secured route
    router.route("/logout").post(jwtValidator,logOutUser);
    router.route("/refresh-token").post(refreshAccessToken);

export default router;


