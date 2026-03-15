import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../exceptions';

export function authorize(...allowedRoles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new ForbiddenError('Access denied'));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(new ForbiddenError('Insufficient permissions'));
      return;
    }

    next();
  };
}

export function organizationGuard(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    next(new ForbiddenError('Access denied'));
    return;
  }

  // Admins can access any organization's data
  if (req.user.role === 'admin') {
    next();
    return;
  }

  // Users can only access their own organization's data
  const requestedOrgId = req.params.organizationId || req.body.organizationId;
  if (requestedOrgId && requestedOrgId !== req.user.organizationId) {
    next(new ForbiddenError('Access denied to this organization'));
    return;
  }

  next();
}
