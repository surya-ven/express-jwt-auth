import express from "express";
import dotenv from "dotenv"; // remove for production
import morgan from "morgan";
import cookieParser from "cookie-parser";
import connectDB from "./db";
import authRoutes from "./routes/auth.route";
import { requireAuth, checkUser } from "./middleware/auth.middleware";

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
  console.log(process.env.NODE_ENV);
}

const app = express();

// middleware
app.use(express.static('public'));
app.use(morgan("tiny"));
app.use(express.json());
app.use(cookieParser());
app.use(checkUser);

// view engine
app.set('view engine', 'ejs');

// database connection
connectDB();

// routes
app.get('/', (req, res) => res.render('home'));
app.get('/smoothies', requireAuth, (req, res) => res.render('smoothies'));
app.use("/auth", authRoutes);

// 404
app.use((req, res) => res.render("doesNotExist"));

app.listen(3000, () => console.log('Server started on port 3000'));