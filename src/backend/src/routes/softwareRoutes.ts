import { Router } from "express";
import { SoftwareController } from "../controllers/softwareController";
import {
  authenticateToken,
  requireAdmin,
  requireManagerial,
} from "../middleware/auth";
import { validateDto, validateParams } from "../middleware/validation";
import { CreateSoftwareDto, UpdateSoftwareDto } from "../dto";

const router = Router();
const softwareController = new SoftwareController();

// All software routes require authentication
router.use(authenticateToken);

// Public (authenticated) routes
router.get("/", softwareController.getAllSoftware);
router.get("/search", softwareController.searchSoftware);
router.get("/access-level/:level", softwareController.getSoftwareByAccessLevel);
router.get("/name/:name", softwareController.getSoftwareByName);
router.get("/:id", validateParams(["id"]), softwareController.getSoftwareById);

router.get(
  "/:id/stats",
  requireManagerial,
  validateParams(["id"]),
  softwareController.getSoftwareStats
);

// Admin only routes
router.post(
  "/",
  requireAdmin,
  validateDto(CreateSoftwareDto),
  softwareController.createSoftware
);

router.put(
  "/:id",
  requireAdmin,
  validateParams(["id"]),
  validateDto(UpdateSoftwareDto),
  softwareController.updateSoftware
);

router.delete(
  "/:id",
  requireAdmin,
  validateParams(["id"]),
  softwareController.deleteSoftware
);

export default router;
