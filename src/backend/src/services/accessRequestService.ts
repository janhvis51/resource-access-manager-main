import { AppDataSource } from "../config/database";
import { AccessRequest } from "../entities/AccessRequest";
import {
  CreateAccessRequestDto,
  UpdateAccessRequestDto,
  RequestStatus,
} from "../types";
import { AppError } from "../middleware/errorHandler";

export class AccessRequestService {
  private accessRequestRepository = AppDataSource.getRepository(AccessRequest);

  async findAll(): Promise<AccessRequest[]> {
    return await this.accessRequestRepository.find({
      relations: ["user", "software"],
      order: { createdAt: "DESC" },
    });
  }

  async findById(id: number): Promise<AccessRequest> {
    const accessRequest = await this.accessRequestRepository.findOne({
      where: { id },
      relations: ["user", "software"],
    });

    if (!accessRequest) {
      throw new AppError(`Access request with ID ${id} not found`, 404);
    }

    return accessRequest;
  }

  async findByUserId(userId: number): Promise<AccessRequest[]> {
    return await this.accessRequestRepository.find({
      where: { user: { id: userId } },
      relations: ["user", "software"],
      order: { createdAt: "DESC" },
    });
  }

  async findPendingRequests(): Promise<AccessRequest[]> {
    return await this.accessRequestRepository.find({
      where: { status: RequestStatus.PENDING },
      relations: ["user", "software"],
      order: { createdAt: "DESC" },
    });
  }

  async create(requestData: CreateAccessRequestDto): Promise<AccessRequest> {
    const { userId, softwareId, requestedAccessLevel, businessJustification } =
      requestData;

    // Check if user already has a pending or approved request for this software
    const existingRequest = await this.accessRequestRepository.findOne({
      where: {
        user: { id: userId },
        software: { id: softwareId },
        status: RequestStatus.PENDING,
      },
    });

    if (existingRequest) {
      throw new AppError(
        "You already have a pending request for this software",
        409
      );
    }

    const approvedRequest = await this.accessRequestRepository.findOne({
      where: {
        user: { id: userId },
        software: { id: softwareId },
        status: RequestStatus.APPROVED,
      },
    });

    if (approvedRequest) {
      throw new AppError(
        "You already have approved access to this software",
        409
      );
    }

    const accessRequest = this.accessRequestRepository.create({
      user: { id: userId },
      software: { id: softwareId },
      requestedAccessLevel,
      businessJustification,
      status: RequestStatus.PENDING,
    });

    return await this.accessRequestRepository.save(accessRequest);
  }

  async updateStatus(
    id: number,
    status: RequestStatus,
    reviewerId?: number,
    reviewComments?: string
  ): Promise<AccessRequest> {
    const accessRequest = await this.findById(id);

    // Validate status transition
    if (accessRequest.status !== RequestStatus.PENDING) {
      throw new AppError("Only pending requests can be updated", 400);
    }

    // Validate status value
    const validStatuses = Object.values(RequestStatus);
    if (!validStatuses.includes(status)) {
      throw new AppError(`Invalid status: ${status}`, 400);
    }

    const updateData: UpdateAccessRequestDto = {
      status,
      reviewedAt: new Date(),
      reviewComments,
    };

    if (reviewerId) {
      updateData.reviewedBy = { id: reviewerId };
    }

    await this.accessRequestRepository.update(id, updateData);

    return await this.findById(id);
  }

  async delete(id: number): Promise<void> {
    const accessRequest = await this.findById(id);

    // Only allow deletion of pending requests
    if (accessRequest.status !== RequestStatus.PENDING) {
      throw new AppError("Only pending requests can be deleted", 400);
    }

    await this.accessRequestRepository.remove(accessRequest);
  }

  async findBySoftwareId(softwareId: number): Promise<AccessRequest[]> {
    return await this.accessRequestRepository.find({
      where: { software: { id: softwareId } },
      relations: ["user", "software"],
      order: { createdAt: "DESC" },
    });
  }

  async getRequestStats(): Promise<{
    totalRequests: number;
    pendingRequests: number;
    approvedRequests: number;
    rejectedRequests: number;
  }> {
    const [total, pending, approved, rejected] = await Promise.all([
      this.accessRequestRepository.count(),
      this.accessRequestRepository.count({
        where: { status: RequestStatus.PENDING },
      }),
      this.accessRequestRepository.count({
        where: { status: RequestStatus.APPROVED },
      }),
      this.accessRequestRepository.count({
        where: { status: RequestStatus.REJECTED },
      }),
    ]);

    return {
      totalRequests: total,
      pendingRequests: pending,
      approvedRequests: approved,
      rejectedRequests: rejected,
    };
  }

  async getUserRequestStats(userId: number): Promise<{
    totalRequests: number;
    pendingRequests: number;
    approvedRequests: number;
    rejectedRequests: number;
  }> {
    const [total, pending, approved, rejected] = await Promise.all([
      this.accessRequestRepository.count({ where: { user: { id: userId } } }),
      this.accessRequestRepository.count({
        where: { user: { id: userId }, status: RequestStatus.PENDING },
      }),
      this.accessRequestRepository.count({
        where: { user: { id: userId }, status: RequestStatus.APPROVED },
      }),
      this.accessRequestRepository.count({
        where: { user: { id: userId }, status: RequestStatus.REJECTED },
      }),
    ]);

    return {
      totalRequests: total,
      pendingRequests: pending,
      approvedRequests: approved,
      rejectedRequests: rejected,
    };
  }

  async findRequestsByStatus(status: RequestStatus): Promise<AccessRequest[]> {
    return await this.accessRequestRepository.find({
      where: { status },
      relations: ["user", "software"],
      order: { createdAt: "DESC" },
    });
  }

  async findRequestsByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<AccessRequest[]> {
    return await this.accessRequestRepository
      .createQueryBuilder("accessRequest")
      .leftJoinAndSelect("accessRequest.user", "user")
      .leftJoinAndSelect("accessRequest.software", "software")
      .where("accessRequest.createdAt BETWEEN :startDate AND :endDate", {
        startDate,
        endDate,
      })
      .orderBy("accessRequest.createdAt", "DESC")
      .getMany();
  }
}
