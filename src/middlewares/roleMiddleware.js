/**
 * requireRole(...allowedRoles)
 * Usage: app.get("/admin", authMiddleware, requireRole("admin"), handler)
 */
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "Not authenticated" });
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden: insufficient role" });
    }
    next();
  };
};

/**
 * requireOwnership(Model, idParam = 'id', ownerField = 'collector')
 * Generic ownership guard for resource-level checks.
 * Example usage:
 *   router.patch("/:id", authMiddleware, requireOwnership(Listing, "id", "collector"), updateHandler)
 */
export const requireOwnership = (Model, idParam = "id", ownerField = "collector") => {
  return async (req, res, next) => {
    try {
      // ensure auth middleware ran first
      if (!req.user) return res.status(401).json({ error: "Not authenticated" });

      const resourceId = req.params[idParam];
      if (!resourceId) return res.status(400).json({ error: "Missing resource id param" });

      const resource = await Model.findById(resourceId);
      if (!resource) return res.status(404).json({ error: "Resource not found" });

      // allow admin to bypass ownership
      if (req.user.role === "admin" || resource[ownerField].toString() === req.user._id.toString()) {
        // attach resource for handler convenience
        req.resource = resource;
        return next();
      }

      return res.status(403).json({ error: "Forbidden: not owner" });
    } catch (err) {
      console.error("Ownership middleware error:", err);
      return res.status(500).json({ error: "Server error" });
    }
  };
};
