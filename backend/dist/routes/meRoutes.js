"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/meRoutes.ts
const express_1 = require("express");
const meController_1 = require("../controllers/meController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
router.get('/me', authMiddleware_1.authenticateToken, meController_1.getMe);
exports.default = router;
