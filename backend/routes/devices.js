const express = require("express");
const mongoose = require("mongoose");
const Device = require("../models/Device");

const router = express.Router();

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const checkId = (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "ID không hợp lệ" });
  }
  next();
};

const handleError = (err, res) => {
  if (err.name === "ValidationError") {
    return res.status(400).json({
      message: "Dữ liệu không hợp lệ",
      errors: Object.values(err.errors).map((e) => e.message),
    });
  }
  if (err.code === 11000) {
    return res.status(409).json({ message: "Mã thiết bị đã tồn tại" });
  }
  if (err.name === "CastError") {
    return res.status(400).json({ message: "Dữ liệu không hợp lệ" });
  }
  console.error(err);
  return res.status(500).json({ message: "Lỗi máy chủ" });
};

// GET /api/devices?search=...
router.get("/", async (req, res) => {
  try {
    const { search } = req.query;
    let filter = {};
    if (typeof search === "string" && search.trim()) {
      const re = new RegExp(escapeRegex(search.trim()), "i");
      filter = {
        $or: [{ deviceId: re }, { name: re }, { deviceType: re }, { room: re }],
      };
    }
    const devices = await Device.find(filter).sort({ createdAt: -1 });
    res.json(devices);
  } catch (e) {
    handleError(e, res);
  }
});

// GET /api/devices/:id
router.get("/:id", checkId, async (req, res) => {
  try {
    const d = await Device.findById(req.params.id);
    if (!d) return res.status(404).json({ message: "Không tìm thấy thiết bị" });
    res.json(d);
  } catch (e) {
    handleError(e, res);
  }
});

// POST /api/devices
router.post("/", async (req, res) => {
  try {
    const d = await Device.create(req.body);
    res.status(201).json(d);
  } catch (e) {
    handleError(e, res);
  }
});

// PUT /api/devices/:id
router.put("/:id", checkId, async (req, res) => {
  try {
    const d = await Device.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: "after",
      runValidators: true,
    });
    if (!d) return res.status(404).json({ message: "Không tìm thấy thiết bị" });
    res.json(d);
  } catch (e) {
    handleError(e, res);
  }
});

// DELETE /api/devices/:id
router.delete("/:id", checkId, async (req, res) => {
  try {
    const d = await Device.findByIdAndDelete(req.params.id);
    if (!d) return res.status(404).json({ message: "Không tìm thấy thiết bị" });
    res.json({ message: "Đã xóa thiết bị" });
  } catch (e) {
    handleError(e, res);
  }
});

module.exports = router;
