import * as orderService from "../services/order.service.js";

export const createOrder = async (req, res) => {
    try {
        if (req.user.role !== "buyer") {
            return res.status(403).json({ error: "Only buyers can create orders" });
        }

        const { listingId, quantityKg, contactPhone, pickup, notes } = req.body;
        if (!listingId || !quantityKg) {
            return res.status(400).json({ error: "listingId and quantityKg are required" });
        }

        const qty = Number(quantityKg);
        if (isNaN(qty) || qty <= 0) {
            return res.status(400).json({ error: "Invalid quantityKg" });
        }

        try {
            const order = await orderService.createOrder({
                buyerId: req.user._id,
                listingId,
                quantityKg: qty,
                contactPhone,
                pickup,
                notes
            });
            return res.status(201).json({ order });
        } catch (err) {
            return res.status(400).json({ error: err.message || "Unable to create order" });
        }
    } catch (err) {
        console.error("Create order error:", err);
        return res.status(500).json({ error: "Server error" });
    }
};

export const getMyOrders = async (req, res) => {
    try {
        if (req.user.role === "buyer") {
            const orders = await orderService.getOrdersByBuyer(req.user._id);
            return res.status(200).json({ orders });
        } else if (req.user.role === "collector") {
            const orders = await orderService.getOrdersByCollector(req.user._id);
            return res.status(200).json({ orders });
        } else {
            return res.status(403).json({ error: "Not authorized" });
        }
    } catch (err) {
        console.error("Get orders error:", err);
        return res.status(500).json({ error: "Server error" });
    }
};

export const getOrder = async (req, res) => {
    try {
        const order = await orderService.getOrderById(req.params.id);
        if (!order) return res.status(404).json({ error: "Order not found" });

        // Ensure requester is buyer or collector on the order
        if (String(order.buyer._id) !== String(req.user._id) && String(order.collector._id) !== String(req.user._id)) {
            return res.status(403).json({ error: "Not authorized to view this order" });
        }

        return res.status(200).json({ order });
    } catch (err) {
        console.error("Get order error:", err);
        return res.status(500).json({ error: "Server error" });
    }
};

export const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!status) return res.status(400).json({ error: "status is required" });

        try {
            const updated = await orderService.updateOrderStatus(req.params.id, req.user._id, req.user.role, status);
            if (!updated) return res.status(404).json({ error: "Order not found" });
            return res.status(200).json({ order: updated });
        } catch (err) {
            const msg = err.message || "Unable to update order";
            if (msg === "Not authorized") return res.status(403).json({ error: msg });
            return res.status(400).json({ error: msg });
        }
    } catch (err) {
        console.error("Update order error:", err);
        return res.status(500).json({ error: "Server error" });
    }
};