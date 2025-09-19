import { Request, Response } from 'express';
import { taskService } from '../services/taskService';
import { AuthenticatedRequest, TaskCompletionRequest } from '../types';

export class TaskController {
  // GET /api/tasks - Get all available tasks
  async getAllTasks(req: Request, res: Response): Promise<void> {
    try {
      const result = await taskService.getAllTasks();
      
      if (!result.success) {
        res.status(500).json({
          success: false,
          error: result.error
        });
        return;
      }

      res.json({
        success: true,
        data: result.data
      });
    } catch (error) {
      console.error('Get all tasks error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // GET /api/tasks/user - Get tasks with user completion status
  async getUserTasks(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

      const result = await taskService.getTasksForUser(userId);
      
      if (!result.success) {
        res.status(500).json({
          success: false,
          error: result.error
        });
        return;
      }

      res.json({
        success: true,
        data: result.data
      });
    } catch (error) {
      console.error('Get user tasks error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // POST /api/tasks/complete - Mark task as completed
  async completeTask(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

      const { taskId, verificationData }: TaskCompletionRequest = req.body;
      
      if (!taskId) {
        res.status(400).json({
          success: false,
          error: 'Task ID is required'
        });
        return;
      }

      const result = await taskService.completeTask(userId, taskId, verificationData);
      
      if (!result.success) {
        res.status(400).json({
          success: false,
          error: result.error
        });
        return;
      }

      res.json({
        success: true,
        data: result.data,
        message: 'Task completed successfully'
      });
    } catch (error) {
      console.error('Complete task error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // GET /api/tasks/stats - Get user task statistics
  async getUserTaskStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

      const result = await taskService.getUserTaskStats(userId);
      
      if (!result.success) {
        res.status(500).json({
          success: false,
          error: result.error
        });
        return;
      }

      res.json({
        success: true,
        data: result.data
      });
    } catch (error) {
      console.error('Get user task stats error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // GET /api/tasks/:taskId - Get specific task details
  async getTaskById(req: Request, res: Response): Promise<void> {
    try {
      const { taskId } = req.params;
      
      if (!taskId) {
        res.status(400).json({
          success: false,
          error: 'Task ID is required'
        });
        return;
      }

      const result = await taskService.getTaskById(taskId);
      
      if (!result.success) {
        res.status(404).json({
          success: false,
          error: result.error
        });
        return;
      }

      res.json({
        success: true,
        data: result.data
      });
    } catch (error) {
      console.error('Get task by ID error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // GET /api/tasks/leaderboard - Get task completion leaderboard
  async getTaskLeaderboard(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      
      if (limit > 100) {
        res.status(400).json({
          success: false,
          error: 'Limit cannot exceed 100'
        });
        return;
      }

      const result = await taskService.getTaskLeaderboard(limit);
      
      if (!result.success) {
        res.status(500).json({
          success: false,
          error: result.error
        });
        return;
      }

      res.json({
        success: true,
        data: result.data
      });
    } catch (error) {
      console.error('Get task leaderboard error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // GET /api/tasks/eligibility - Check airdrop eligibility
  async checkAirdropEligibility(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

      const result = await taskService.checkAirdropEligibility(userId);
      
      if (!result.success) {
        res.status(500).json({
          success: false,
          error: result.error
        });
        return;
      }

      res.json({
        success: true,
        data: result.data
      });
    } catch (error) {
      console.error('Check airdrop eligibility error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // DELETE /api/tasks/:taskId/reset - Reset task completion (admin only)
  async resetTaskCompletion(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { taskId } = req.params;
      const { targetUserId } = req.body;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

      if (!taskId) {
        res.status(400).json({
          success: false,
          error: 'Task ID is required'
        });
        return;
      }

      // For now, allow users to reset their own tasks
      // In production, add admin role check here
      const userToReset = targetUserId || userId;
      
      const result = await taskService.resetTaskCompletion(userToReset, taskId);
      
      if (!result.success) {
        res.status(500).json({
          success: false,
          error: result.error
        });
        return;
      }

      res.json({
        success: true,
        message: 'Task completion reset successfully'
      });
    } catch (error) {
      console.error('Reset task completion error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // GET /api/tasks/health - Health check endpoint
  async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      res.json({
        success: true,
        message: 'Task service is healthy',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Task health check error:', error);
      res.status(500).json({
        success: false,
        error: 'Task service is unhealthy'
      });
    }
  }
}

// Export singleton instance
export const taskController = new TaskController();