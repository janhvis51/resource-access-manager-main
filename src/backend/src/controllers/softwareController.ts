import { Response } from "express";
import { SoftwareService } from "../services/softwareService";
import { CreateSoftwareDto, UpdateSoftwareDto, AccessLevel } from "../types";
import { asyncHandler } from "../middleware/errorHandler";
import { AuthRequest } from "../middleware/auth";

export class SoftwareController {
  private softwareService = new SoftwareService();

  // GET /api/software
  getAllSoftware = asyncHandler(async (req: AuthRequest, res: Response) => {
    const software = await this.softwareService.findAll();

    res.status(200).json({
      message: "Software retrieved successfully",
      data: software,
      count: software.length,
    });
  });

  // GET /api/software/:id
  getSoftwareById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = parseInt(req.params.id);
    const software = await this.softwareService.findById(id);

    res.status(200).json({
      message: "Software retrieved successfully",
      data: software,
    });
  });

  // POST /api/software (Admin only)
  createSoftware = asyncHandler(async (req: AuthRequest, res: Response) => {
    const softwareData: CreateSoftwareDto = req.body;
    const software = await this.softwareService.create(softwareData);

    res.status(201).json({
      message: "Software created successfully",
      data: software,
    });
  });

  // PUT /api/software/:id (Admin only)
  updateSoftware = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = parseInt(req.params.id);
    const softwareData: UpdateSoftwareDto = req.body;
    const software = await this.softwareService.update(id, softwareData);

    res.status(200).json({
      message: "Software updated successfully",
      data: software,
    });
  });

  // DELETE /api/software/:id (Admin only)
  deleteSoftware = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = parseInt(req.params.id);
    await this.softwareService.delete(id);

    res.status(200).json({
      message: "Software deleted successfully",
    });
  });

  // GET /api/software/name/:name
  getSoftwareByName = asyncHandler(async (req: AuthRequest, res: Response) => {
    const name = req.params.name;
    const software = await this.softwareService.findByName(name);

    if (!software) {
      return res.status(404).json({
        error: "Software not found",
      });
    }

    res.status(200).json({
      message: "Software retrieved successfully",
      data: software,
    });
  });

  // GET /api/software/:id/stats (Admin/Manager only)
  getSoftwareStats = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = parseInt(req.params.id);
    const stats = await this.softwareService.getSoftwareStats(id);

    res.status(200).json({
      message: "Software statistics retrieved successfully",
      data: stats,
    });
  });

  // GET /api/software/access-level/:level
  getSoftwareByAccessLevel = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const accessLevel = req.params.level as AccessLevel;

      // Validate access level
      if (!Object.values(AccessLevel).includes(accessLevel)) {
        return res.status(400).json({
          error: "Invalid access level",
          validLevels: Object.values(AccessLevel),
        });
      }

      const software = await this.softwareService.findSoftwareByAccessLevel(
        accessLevel
      );

      res.status(200).json({
        message: `Software with ${accessLevel} access retrieved successfully`,
        data: software,
        count: software.length,
      });
    }
  );

  // GET /api/software/search
  searchSoftware = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { q: query } = req.query;

    if (!query || typeof query !== "string") {
      return res.status(400).json({
        error: "Search query is required",
      });
    }

    // Get all software and filter by name or description
    const allSoftware = await this.softwareService.findAll();
    const filteredSoftware = allSoftware.filter(
      (software) =>
        software.name.toLowerCase().includes(query.toLowerCase()) ||
        software.description.toLowerCase().includes(query.toLowerCase())
    );

    res.status(200).json({
      message: "Software search completed",
      data: filteredSoftware,
      count: filteredSoftware.length,
      query,
    });
  });
}
