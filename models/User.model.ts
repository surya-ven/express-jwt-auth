import { Document, Model, model, Schema, HydratedDocument } from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";

interface UserDocument extends Document {
  email: string;
  password: string;
}

interface UserStatic extends Model<UserDocument> {
    login: (email: string, password: string) => Promise<UserDocument>;
}

const userSchema = new Schema({
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, "Please enter a valid email"]
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [6, "Password must be at least 6 characters"]
    }
});

// Mongoose hook
// Pass in function instead of arrow function to 
// use 'this' keyword to access User object

// // fire a function after (post) document is saved ("save") to db
// userSchema.post("save", function(doc, next) {
//     console.log("new user was created", doc);
//     next();
// });

// fire a function before (pre) document is saved ("save") to db
userSchema.pre("save", async function(next) {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// static method to login user
userSchema.statics.login = async function(email, password): Promise<HydratedDocument<UserDocument>> {
    const user = await this.findOne({ email: email });
    
    if (user) {
        const auth = await bcrypt.compare(password, user.password);
        if (auth) {
            return user;
        }
        throw Error("incorrect password");
    }
    throw Error("incorrect email");
}

// "user" is singular of the collection name
const User = model<UserDocument, UserStatic>("user", userSchema);

export default User;