const Admin = require("../models/adminModel");

module.exports = async (req, res, next) => {
  try {
    if (!req.session.adminId) {
      return res.redirect("/admin/login");
    }

    const admin = await Admin.findById(req.session.adminId);

    if (!admin) {
      return res.redirect("/admin/login");
    }

    req.admin = admin; // attach admin
    next(); // ✅ ALLOW
  } catch (err) {
    console.error("❌ isAdmin middleware error:", err);
    res.redirect("/admin/login");
  }
};
