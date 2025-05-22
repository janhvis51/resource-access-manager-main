import {
  IsString,
  IsNotEmpty,
  MinLength,
  IsEnum,
  IsArray,
  IsNumber,
  IsOptional,
  ArrayNotEmpty,
  IsInt,
  Min,
} from "class-validator";
import { UserRole, AccessLevel, RequestStatus } from "../types";

// Auth DTOs
export class LoginDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsEnum(UserRole)
  role: UserRole;
}

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  oldPassword: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  newPassword: string;
}

// Software DTOs
export class CreateSoftwareDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(AccessLevel, { each: true })
  accessLevels: AccessLevel[];
}

export class UpdateSoftwareDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(AccessLevel, { each: true })
  accessLevels?: AccessLevel[];
}

// Access Request DTOs
export class CreateAccessRequestDto {
  @IsNumber()
  @IsInt()
  @Min(1)
  softwareId: number;

  @IsEnum(AccessLevel)
  requestedAccessLevel: AccessLevel;

  @IsString()
  @IsNotEmpty()
  businessJustification: string;
}

export class UpdateRequestStatusDto {
  @IsEnum(RequestStatus)
  status: RequestStatus;

  @IsOptional()
  @IsString()
  reviewComments?: string;
}
