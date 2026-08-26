import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";

import orderDetailRoutes from "./routes/orderDetailRoutes.js"
import orderRoutes from "./routes/orderRoutes.js"
import produkRoutes from "./routes/produkRoutes.js"
import userRoutes from "./routes/userRoutes.js"

dotenv.config()

const app = express()
const PORT = process.env.PORT

// Middleware
app.use(express.json())
app.use(cors()) // Penghubung Backend dengan Frontend dengan PORT berbeda
app.use(morgan("dev")) // Log the request

app.use("/api/v1/order-details", orderDetailRoutes)
app.use("/api/v1/orders", orderRoutes)
app.use("/api/v1/produk", produkRoutes)
app.use("/api/v1/user", userRoutes)

app.listen(PORT, () => {
    console.log(`========== Server is running on port ${PORT} ==========`)
});