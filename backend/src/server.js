import express from "express";
import cors from "cors";
import "dotenv/config";
import morgan from "morgan";
import multer from "multer";

import orderRoutes from "./routes/orderRoutes.js"
import productRoutes from "./routes/productRoutes.js"
import userRoutes from "./routes/userRoutes.js"

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(express.json())
app.use(cors())
app.use(morgan("dev"))

// API Endpoint
app.use("/api/v1/orders", orderRoutes)
app.use("/api/v1/products", productRoutes)
app.use("/api/v1/users", userRoutes)

// Not Found
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Endpoint tidak ditemukan",
    })
})

// Error Handler
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        return res.status(400).json({
            success: false,
            message:
                err.code === "LIMIT_FILE_SIZE"
                    ? "Ukuran file maksimal 5MB"
                    : err.message,
        })
    }

    if (err.status) {
        return res.status(err.status).json({
            success: false,
            message: err.message,
        })
    }

    console.error(err)

    return res.status(500).json({
        success: false,
        message: err.message || "Terjadi kesalahan pada server",
    })
})

app.listen(PORT, () => {
    console.log(`========== Server is running on port ${PORT} ==========`)
});
