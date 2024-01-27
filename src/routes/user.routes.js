import { 
    registerUser,
    loginUser,
    logOutUser, 
    refreshAccessToken, 
    changeCurrentPassword, 
    getCurrentUser, 
    updateAccountDetails, 
    updateUserAvatar, 
    updateUserCoverImage, 
    getUserChannelProfile, 
    getWatchHistory 
} from "../controllers/user.controller.js";
import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { jwtValidator } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser);

router.route("/login").post(loginUser);

//secured route
router.route("/logout").post(jwtValidator, logOutUser);

router.route("/refresh-token").post(refreshAccessToken);

router.route("/changed-password").post(jwtValidator, changeCurrentPassword);

router.route("/current-user").get(jwtValidator, getCurrentUser);

router.route("/update-account").patch(jwtValidator, updateAccountDetails);

router.route("/avatar").patch(jwtValidator, upload.single("avatar"), updateUserAvatar);

router.route("/coverImage").patch(jwtValidator, upload.single("coverImage"), updateUserCoverImage);

router.route("/c/:userName").get(jwtValidator, getUserChannelProfile);

router.route("/history").get(jwtValidator, getWatchHistory);

export default router;


