import { Response } from "express";
import { AccessRequestService } from "../services/accessRequestService";
import { CreateAccessRequestDto, RequestStatus, UserRole } from "../types";
import { asyncHandler } from "../middleware/errorHandler";
import { AuthRequest } from "../middleware/auth";

export class AccessRequestController {
  private accessRequestService = new AccessRequestService();

  // GET /api/requests
  getAllRequests = asyncHandler(async (req: AuthRequest, res: Response) => {
    let requests;

    // Employees can only see their own requests
    if (req.user!.role === UserRole.EMPLOYEE) {
      requests = await this.accessRequestService.findByUserId(req.user!.userId);
    } else {
      // Managers and Admins can see all requests
      requests = await this.accessRequestService.findAll();
    }

    res.status(200).json({
      message: "Access requests retrieved successfully",
      data: requests,
      count: requests.length,
    });
  });

  // GET /api/requests/:id
  getRequestById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = parseInt(req.params.id);
    const request = await this.accessRequestService.findById(id);

    // Employees can only view their own requests
    if (
      req.user!.role === UserRole.EMPLOYEE &&
      request.userId !== req.user!.userId
    ) {
      return res.status(403).json({
        error: "You can only view your own requests",
      });
    }

    res.status(200).json({
      message: "Access request retrieved successfully",
      data: request,
    });
  });

  // POST /api/requests (Employee, Manager, Admin)
  createRequest = asyncHandler(async (req: AuthRequest, res: Response) => {
    const requestData: Omit<CreateAccessRequestDto, "userId"> = req.body;

    const fullRequestData: CreateAccessRequestDto = {
      ...requestData,
      userId: req.user!.userId,
    };

    const request = await this.accessRequestService.create(fullRequestData);

    res.status(201).json({
      message: "Access request created successfully",
      data: request,
    });
  });

  // GET /api/requests/pending (Manager, Admin only)
  getPendingRequests = asyncHandler(async (req: AuthRequest, res: Response) => {
    const requests = await this.accessRequestService.findPendingRequests();

    res.status(200).json({
      message: "Pending requests retrieved successfully",
      data: requests,
      count: requests.length,
    });
  });

  // PATCH /api/requests/:id (Manager, Admin only)
  updateRequestStatus = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const id = parseInt(req.params.id);
      const { status, reviewComments } = req.body;

      if (!status || !Object.values(RequestStatus).includes(status)) {
        return res.status(400).json({
          error: "Valid status is required",
          validStatuses: Object.values(RequestStatus),
        });
      }

      const request = await this.accessRequestService.updateStatus(
        id,
        status,
        req.user!.userId,
        reviewComments
      );

      res.status(200).json({
        message: `Request ${status.toLowerCase()} successfully`,
        data: request,
      });
    }
  );

  // DELETE /api/requests/:id
  deleteRequest = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = parseInt(req.params.id);
    const request = await this.accessRequestService.findById(id);

    // Employees can only delete their own pending requests
    if (
      req.user!.role === UserRole.EMPLOYEE &&
      request.userId !== req.user!.userId
    ) {
      return res.status(403).json({
        error: "You can only delete your own requests",
      });
    }

    await this.accessRequestService.delete(id);

    res.status(200).json({
      message: "Access request deleted successfully",
    });
  });

  // GET /api/requests/user/:userId (Manager, Admin only, or own requests)
  getRequestsByUserId = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const userId = parseInt(req.params.userId);

      // Employees can only view their own requests
      if (req.user!.role === UserRole.EMPLOYEE && userId !== req.user!.userId) {
        return res.status(403).json({
          error: "You can only view your own requests",
        });
      }

      const requests = await this.accessRequestService.findByUserId(userId);

      res.status(200).json({
        message: "User requests retrieved successfully",
        data: requests,
        count: requests.length,
      });
    }
  );

  // GET /api/requests/software/:softwareId (Manager, Admin only)
  getRequestsBySoftwareId = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const softwareId = parseInt(req.params.softwareId);
      const requests = await this.accessRequestService.findBySoftwareId(
        softwareId
      );

      res.status(200).json({
        message: "Software requests retrieved successfully",
        data: requests,
        count: requests.length,
      });
    }
  );

  // GET /api/requests/stats (Manager, Admin only)
  getRequestStats = asyncHandler(async (req: AuthRequest, res: Response) => {
    const stats = await this.accessRequestService.getRequestStats();

    res.status(200).json({
      message: "Request statistics retrieved successfully",
      data: stats,
    });
  });

  // GET /api/requests/stats/user (Get current user's stats)
  getUserRequestStats = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const stats = await this.accessRequestService.getUserRequestStats(
        req.user!.userId
      );

      res.status(200).json({
        message: "User request statistics retrieved successfully",
        data: stats,
      });
    }
  );

  // GET /api/requests/status/:status
  getRequestsByStatus = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const status = req.params.status as RequestStatus;

      if (!Object.values(RequestStatus).includes(status)) {
        return res.status(400).json({
          error: "Invalid status",
          validStatuses: Object.values(RequestStatus),
        });
      }

      let requests;

      // Employees can only see their own requests
      if (req.user!.role === UserRole.EMPLOYEE) {
        const allUserRequests = await this.accessRequestService.findByUserId(
          req.user!.userId
        );
        requests = allUserRequests.filter((req) => req.status === status);
      } else {
        requests = await this.accessRequestService.findRequestsByStatus(status);
      }

      res.status(200).json({
        message: `${status} requests retrieved successfully`,
        data: requests,
        count: requests.length,
      });
    }
  );

  // GET /api/requests/date-range
  getRequestsByDateRange = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          error: "Start date and end date are required",
        });
      }

      const start = new Date(startDate as string);
      const end = new Date(endDate as string);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({
          error: "Invalid date format",
        });
      }

      if (start > end) {
        return res.status(400).json({
          error: "Start date must be before end date",
        });
      }

      const requests = await this.accessRequestService.findRequestsByDateRange(
        start,
        end
      );

      res.status(200).json({
        message: "Requests by date range retrieved successfully",
        data: requests,
        count: requests.length,
        dateRange: { startDate, endDate },
      });
    }
  );
}
