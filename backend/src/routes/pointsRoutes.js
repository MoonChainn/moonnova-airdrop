// src/routes/pointsRoutes.js
import express from "express";
import { addPoints, getPointsSummary, getPointsHistory } from "../controllers/pointsController.js";

const router = express.Router();

router.post("/add", addPoints);
router.get("/summary/:userId", getPointsSummary);
router.get("/history/:userId", getPointsHistory);

export default router;
