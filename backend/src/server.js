import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";

// import homeRoutes from "./routes/homeRoutes.js"

dotenv.config()

const app = express()
const PORT = process.env.PORT

// Middleware
app.use(express.json())
app.use(cors()) // Penghubung Backend dengan Frontend dengan PORT berbeda
app.use(morgan("dev")) // Log the request

// app.use("/api/v1/home", homeRoutes)

app.listen(PORT, () => {
    console.log(`========== Server is running on port ${PORT} ==========`)
});