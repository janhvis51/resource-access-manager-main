import { AppDataSource } from '../config/database';
import { Software } from '../entities/Software';
import { CreateSoftwareDto, UpdateSoftwareDto, AccessLevel } from '../types';
import { AppError } from '../middleware/errorHandler';

export class SoftwareService {
  private softwareRepository = AppDataSource.getRepository(Software);

  async findAll(): Promise<Software[]> {
    return await this.softwareRepository.find({
      relations: ['requests'],
      order: { createdAt: 'DESC' }
    });
  }

  async findById(id: number): Promise<Software> {
    const software = await this.softwareRepository.findOne({
      where: { id },
      relations: ['requests', 'requests.user']
    });

    if (!software) {
      throw new AppError(`Software with ID ${id} not found`, 404);
    }

    return software;
  }

  async create(softwareData: CreateSoftwareDto): Promise<Software> {
    const { name, description, accessLevels } = softwareData;

    // Check if software with same name already exists
    const existingSoftware = await this.softwareRepository.findOne({ where: { name } });
    if (existingSoftware) {
      throw new AppError('Software with this name already exists', 409);
    }

    // Validate access levels
    const validAccessLevels = Object.values(AccessLevel);
    const invalidLevels = accessLevels.filter(level => !validAccessLevels.includes(level));
    if (invalidLevels.length > 0) {
      throw new AppError(`Invalid access levels: ${invalidLevels.join(', ')}`, 400);
    }

    const software = this.softwareRepository.create({
      name,
      description,
      accessLevels
    });

    return await this.softwareRepository.save(software);
  }

  async update(id: number, softwareData: UpdateSoftwareDto): Promise<Software> {
    const software = await this.findById(id);

    // Check if name is being updated and doesn't conflict
    if (softwareData.name && softwareData.name !== software.name) {
      const existingSoftware = await this.softwareRepository.findOne({ 
        where: { name: softwareData.name } 
      });
      if (existingSoftware) {
        throw new AppError('Software with this name already exists', 409);
      }
    }

    // Validate access levels if provided
    if (softwareData.accessLevels) {
      const validAccessLevels = Object.values(AccessLevel);
      const invalidLevels = softwareData.accessLevels.filter(
        level => !validAccessLevels.includes(level)
      );
      if (invalidLevels.length > 0) {
        throw new AppError(`Invalid access levels: ${invalidLevels.join(', ')}`, 400);
      }
    }

    // Update software
    await this.softwareRepository.update(id, softwareData);

    return await this.findById(id);
  }

  async delete(id: number): Promise<void> {
    const software = await this.findById(id);

    // Check if software has any pending requests
    const pendingRequests = software.requests?.filter(req => req.status === 'Pending') || [];
    if (pendingRequests.length > 0) {
      throw new AppError(
        'Cannot delete software with pending access requests. Please resolve all pending requests first.',
        400
      );
    }

    await this.softwareRepository.remove(software);
  }

  async findByName(name: string): Promise<Software | null> {
    return await this.softwareRepository.findOne({
      where: { name },
      relations: ['requests']
    });
  }

  async getSoftwareStats(id: number): Promise<{
    totalRequests: number;
    pendingRequests: number;
    approvedRequests: number;
    rejectedRequests: number;
  }> {
    const software = await this.findById(id);
    const requests = software.requests || [];

    return {
      totalRequests: requests.length,
      pendingRequests: requests.filter(req => req.status === 'Pending').length,
      approvedRequests: requests.filter(req => req.status === 'Approved').length,
      rejectedRequests: requests.filter(req => req.status === 'Rejected').length
    };
  }

  async findSoftwareByAccessLevel(accessLevel: AccessLevel): Promise<Software[]> {
    return await this.softwareRepository
      .createQueryBuilder('software')
      .where(':accessLevel = ANY(software.accessLevels)', { accessLevel })
      .getMany();
  }
}