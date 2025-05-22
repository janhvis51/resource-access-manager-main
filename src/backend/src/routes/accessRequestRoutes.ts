import { Router } from 'express';
import { AccessRequestController } from '../controllers/accessRequestController';
import { authenticateToken, requireManagerial } from '../middleware/auth';
import { validateDto, validateParams } from '../middleware/validation';
import { CreateAccessRequestDto, UpdateRequestStatusDto } from '../dto';

const router = Router();
const accessRequestController = new AccessRequestController();

// All request routes require authentication
router.use(authenticateToken);

// General routes (role-based access handled in controller)
router.get('/', accessRequestController.getAllRequests);
router.get('/stats/user', accessRequestController.getUserRequestStats);
router.get('/status/:status', accessRequestController.getRequestsByStatus);
router.get('/date-range', accessRequestController.getRequestsByDateRange);

router.post('/', 
  validateDto(CreateAccessRequestDto), 
  accessRequestController.createRequest
);

router.get('/:id', 
  validateParams(['id']), 
  accessRequestController.getRequestById
);

router.delete('/:id', 
  validateParams(['id']), 
  accessRequestController.deleteRequest
);

// Manager/Admin only routes
router.get('/pending', 
  requireManagerial, 
  accessRequestController.getPendingRequests
);

router.get('/stats', 
  requireManagerial, 
  accessRequestController.getRequestStats
);

router.get('/user/:userId', 
  validateParams(['userId']), 
  accessRequestController.getRequestsByUserId
);

router.get('/software/:softwareId', 
  requireManagerial,
  validateParams(['softwareId']), 
  accessRequestController.getRequestsBySoftwareId
);

router.patch('/:id', 
  requireManagerial,
  validateParams(['id']),
  validateDto(UpdateRequestStatusDto), 
  accessRequestController.updateRequestStatus
);

export default router;