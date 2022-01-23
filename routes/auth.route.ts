import { Router } from "express";
import {
    signupGet,
    signupPost,
    loginGet,
    logoutGet,
    loginPost
} from "../controllers/auth.controller.js";

const router = Router();

router.get("/signup", signupGet);

router.post("/signup", signupPost);

router.get("/login", loginGet);

router.post("/login", loginPost);

router.get("/logout", logoutGet);

export default router;