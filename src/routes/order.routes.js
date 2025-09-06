import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { createOrder, getMyOrders, getOrder, updateOrderStatus } from "../controllers/order.controller.js";

const router = express.Router();

// POST /api/orders/create - buyer creates an order
router.post("/create", authMiddleware, createOrder);

// GET /api/orders/my - buyer or collector views their orders
router.get("/my", authMiddleware, getMyOrders);

// GET /api/orders/:id - view a specific order (buyer or collector)
router.get("/:id", authMiddleware, getOrder);

// PATCH /api/orders/:id/status - update order status (collector or buyer)
router.patch("/:id/status", authMiddleware, updateOrderStatus);

export default router;