import { Router } from 'express';
import { taskController } from '../controllers/taskController';
import { authenticateToken, rateLimit } from '../middleware/auth';

const router = Router();

// Rate limiting configurations
const generalRateLimit = rateLimit(100, 15 * 60 * 1000); // 100 requests per 15 minutes
const taskCompletionRateLimit = rateLimit(10, 60 * 1000); // 10 requests per minute
const strictRateLimit = rateLimit(5, 60 * 1000); // 5 requests per minute

// Public routes (no authentication required)

/**
 * @route GET /api/tasks
 * @desc Get all available tasks
 * @access Public
 */
router.get('/', generalRateLimit, taskController.getAllTasks);

/**
 * @route GET /api/tasks/:taskId
 * @desc Get specific task details
 * @access Public
 */
router.get('/:taskId', generalRateLimit, taskController.getTaskById);

/**
 * @route GET /api/tasks/leaderboard
 * @desc Get task completion leaderboard
 * @access Public
 */
router.get('/leaderboard', generalRateLimit, taskController.getTaskLeaderboard);

/**
 * @route GET /api/tasks/health
 * @desc Health check endpoint
 * @access Public
 */
router.get('/health', taskController.healthCheck);

// Protected routes (authentication required)

/**
 * @route GET /api/tasks/user
 * @desc Get tasks with user completion status
 * @access Private
 */
router.get('/user', authenticateToken, generalRateLimit, taskController.getUserTasks);

/**
 * @route POST /api/tasks/complete
 * @desc Mark task as completed
 * @access Private
 */
router.post('/complete', authenticateToken, taskCompletionRateLimit, taskController.completeTask);

/**
 * @route GET /api/tasks/stats
 * @desc Get user task statistics
 * @access Private
 */
router.get('/stats', authenticateToken, generalRateLimit, taskController.getUserTaskStats);

/**
 * @route GET /api/tasks/eligibility
 * @desc Check airdrop eligibility based on task completion
 * @access Private
 */
router.get('/eligibility', authenticateToken, generalRateLimit, taskController.checkAirdropEligibility);

/**
 * @route DELETE /api/tasks/:taskId/reset
 * @desc Reset task completion (admin or self)
 * @access Private
 */
router.delete('/:taskId/reset', authenticateToken, strictRateLimit, taskController.resetTaskCompletion);

// Error handling middleware for this router
router.use((error: any, req: any, res: any, next: any) => {
  console.error('Task routes error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error in task routes'
  });
});

export default router;