import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";

import orderRoutes from "./routes/orderRoutes.js"
import productRoutes from "./routes/productRoutes.js"
import userRoutes from "./routes/userRoutes.js"

dotenv.config()

const app = express()
const PORT = process.env.PORT

// Middleware
app.use(express.json())
app.use(cors())
app.use(morgan("dev"))

// API Endpoint
app.use("/api/v1/orders", orderRoutes)
app.use("/api/v1/products", productRoutes)
app.use("/api/v1/user", userRoutes)

app.listen(PORT, () => {
    console.log(`========== Server is running on port ${PORT} ==========`)
});