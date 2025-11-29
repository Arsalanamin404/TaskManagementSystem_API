import { Request } from 'express';
import { Role } from 'src/generated/prisma/enums';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: Role;
  };
}
