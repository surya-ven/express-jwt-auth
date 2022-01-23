import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { VerifyErrors } from "jsonwebtoken";
import User from "../models/User.model";

interface Err extends NodeJS.ErrnoException {
    errors: any;
}

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.jwt;

    // check if token is valid
    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, (err: VerifyErrors | null, decodedToken: any) => {
            if (err) {
                console.log(err);
                res.redirect("/auth/login");
            } else {
                console.log(decodedToken);
                next();
            }
        });
    } else {
        res.redirect("/auth/login");
    }
}

export const checkUser = (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.jwt;

    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, async (err: VerifyErrors | null, decodedToken: any) => {
            if (err) {
                console.log(err);
                res.locals.user = null;
                next();
            } else {
                console.log(decodedToken);
                const user = await User.findById(decodedToken.id);
                res.locals.user = user;
                next();
            }
        });
    } else {
        res.locals.user = null;
        next();
    }
}