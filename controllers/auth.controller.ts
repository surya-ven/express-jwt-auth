import User from "../models/User.model";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongoose";
import { Request, Response } from "express";

interface Err extends NodeJS.ErrnoException {
    errors: any;
}

type Errors = "email" | "password";

// Handle errors
const handleErrors = (err: Err) => {
    console.log(err.message, err.code);

    let errors = { email: "", password: "" };

    // Login

    // incorrect email
    if (err.message === "incorrect email") {
        errors.email = "That email is not registered";
    }

    // incorrect email
    if (err.message === "incorrect password") {
        errors.password = "That email is not registered";
    }

    // Signup

    // duplicate error code
    if (Number(err.code) === 11000) {
        errors.email = "Email is already taken";
        return errors;
    }

    // validation errors
    if (err.message.includes("user validation failed")) {
        Object.keys(err.errors)
            .map(key => err.errors[key])
            .forEach(err => {
                const { properties } = err;
                const path: Errors = properties.path;
                errors[path] = properties.message;
            });
    }

    return errors;
}

// Token
const createToken = (id: ObjectId) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "1d"
    });
}

// Controllers
export const signupGet = (req: Request, res: Response) => {
    res.render("signup");
}

export const signupPost = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    console.log(email, password);

    try {
        const user = await User.create({ email, password });
        const token = createToken(user._id);
        res.cookie("jwt", token, {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24
        });
        res.status(201).json({ user: user._id });
    } catch (err) {
        const errors = handleErrors(<Err>err);
        res.status(400).json({ errors });
    }
}

export const loginGet = (req: Request, res: Response) => {
    res.render("login");
}

export const loginPost = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    try {
        const user = await User.login(email, password);
        const token = createToken(user._id);
        res.cookie("jwt", token, {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24
        });
        res.status(200).json({ user: user._id });
    } catch (err) {
        const errors = handleErrors(<Err>err);
        res.status(400).json({ errors });
    }
}

export const logoutGet = (req: Request, res: Response) => {
    res.cookie("jwt", "", {
        maxAge: 1
    });
    res.redirect("/");
}