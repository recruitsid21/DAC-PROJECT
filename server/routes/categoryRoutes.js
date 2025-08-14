import express from "express";
import Category from "../models/categoryModel.js";

const router = express.Router();

// Get all active categories
router.get("/", async (req, res, next) => {
  try {
    const categories = await Category.findAll();
    res.status(200).json({
      status: "success",
      data: {
        categories,
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
