import { PrismaClient, Task, TaskCompletion } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { ServiceResponse, TaskCompletionRequest, TaskType } from '../types';

export class TaskService {
  // Get all available tasks
  async getAllTasks(): Promise<ServiceResponse<Task[]>> {
    try {
      const tasks = await prisma.task.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'asc' }
      });

      return {
        success: true,
        data: tasks
      };
    } catch (error) {
      console.error('Get all tasks error:', error);
      return {
        success: false,
        error: 'Failed to get tasks'
      };
    }
  }

  // Get tasks with user completion status
  async getTasksForUser(userId: string): Promise<ServiceResponse<TaskWithCompletion[]>> {
    try {
      const tasks = await prisma.task.findMany({
        where: { isActive: true },
        include: {
          completions: {
            where: { userId }
          }
        },
        orderBy: { createdAt: 'asc' }
      });

      const tasksWithCompletion: TaskWithCompletion[] = tasks.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        type: 'SOCIAL_FOLLOW',
        points: task.points,
        url: '',
        order: 0,
        active: task.isActive,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
        completed: false,
        completedAt: null,
        verificationData: null
      }));

      return {
        success: true,
        data: tasksWithCompletion
      };
    } catch (error) {
      console.error('Get tasks for user error:', error);
      return {
        success: false,
        error: 'Failed to get user tasks'
      };
    }
  }

  // Mark task as completed
  async completeTask(userId: string, taskId: string, verificationData?: any): Promise<ServiceResponse<TaskCompletion>> {
    try {
      // Check if task exists and is active
      const task = await prisma.task.findFirst({
        where: {
          id: taskId,
          isActive: true
        }
      });

      if (!task) {
        return {
          success: false,
          error: 'Task not found or inactive'
        };
      }

      // Check if user already completed this task
      const existingCompletion = await prisma.taskCompletion.findFirst({
        where: {
          userId,
          taskId,
          completedAt: { not: undefined }
        }
      });

      if (existingCompletion) {
        return {
          success: false,
          error: 'Task already completed'
        };
      }

      // Verify task completion based on type
      const verificationResult = await this.verifyTaskCompletion(task, verificationData);
      if (!verificationResult.success) {
        return {
          success: false,
          error: verificationResult.error || 'Task verification failed'
        };
      }

      // Create or update task completion
      const taskCompletion = await prisma.taskCompletion.upsert({
        where: {
          userId_taskId: {
            userId,
            taskId
          }
        },
        update: {
            completedAt: new Date(),
            verified: true
          },
        create: {
          userId,
          taskId,
          completedAt: new Date(),
            verified: true
        }
      });

      return {
        success: true,
        data: taskCompletion
      };
    } catch (error) {
      console.error('Complete task error:', error);
      return {
        success: false,
        error: 'Failed to complete task'
      };
    }
  }

  // Verify task completion based on task type
  private async verifyTaskCompletion(task: Task, verificationData?: any): Promise<ServiceResponse<boolean>> {
    try {
      switch (task.name) {
        case TaskType.SOCIAL_FOLLOW:
          // For social media follows, we might verify through API or just accept user confirmation
          return { success: true, data: true };
          
        case TaskType.SOCIAL_SHARE:
          // For social media shares, verify URL or accept confirmation
          return { success: true, data: true };
          
        case TaskType.TELEGRAM_JOIN:
          // For Telegram joins, we could verify through Telegram Bot API
          return { success: true, data: true };
          
        case TaskType.DISCORD_JOIN:
          // For Discord joins, verify through Discord API
          return { success: true, data: true };
          
        case TaskType.REFERRAL:
          // For referrals, check if user has referred required number of people
          if (verificationData && verificationData.referralCount) {
            const requiredReferrals = task.points / 1000; // Assuming 1000 points per referral
            return {
              success: true,
              data: verificationData.referralCount >= requiredReferrals
            };
          }
          return { success: false, error: 'Referral verification data required' };
          
        case TaskType.CUSTOM:
          // For custom tasks, implement specific verification logic
          return { success: true, data: true };
          
        default:
          return { success: true, data: true };
      }
    } catch (error) {
      console.error('Task verification error:', error);
      return {
        success: false,
        error: 'Task verification failed'
      };
    }
  }

  // Get user's task completion statistics
  async getUserTaskStats(userId: string): Promise<ServiceResponse<{
    totalTasks: number;
    completedTasks: number;
    totalPoints: number;
    completionRate: number;
  }>> {
    try {
      const [totalTasks, completedTasksData] = await Promise.all([
        prisma.task.count({ where: { isActive: true } }),
        prisma.taskCompletion.findMany({
          where: {
            userId,
            completedAt: { not: undefined }
          },
          include: {
            task: true
          }
        })
      ]);

      const completedTasks = completedTasksData.length;
      const totalPoints = completedTasksData.reduce((sum, completion) => {
        return sum + 0; // Points calculation simplified
      }, 0);
      const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

      return {
        success: true,
        data: {
          totalTasks,
          completedTasks,
          totalPoints,
          completionRate: Math.round(completionRate * 100) / 100
        }
      };
    } catch (error) {
      console.error('Get user task stats error:', error);
      return {
        success: false,
        error: 'Failed to get task statistics'
      };
    }
  }

  // Get task by ID
  async getTaskById(taskId: string): Promise<ServiceResponse<Task>> {
    try {
      const task = await prisma.task.findUnique({
        where: { id: taskId }
      });

      if (!task) {
        return {
          success: false,
          error: 'Task not found'
        };
      }

      return {
        success: true,
        data: task
      };
    } catch (error) {
      console.error('Get task by ID error:', error);
      return {
        success: false,
        error: 'Failed to get task'
      };
    }
  }

  // Reset task completion (admin function)
  async resetTaskCompletion(userId: string, taskId: string): Promise<ServiceResponse<boolean>> {
    try {
      await prisma.taskCompletion.deleteMany({
        where: {
          userId,
          taskId
        }
      });

      return {
        success: true,
        data: true
      };
    } catch (error) {
      console.error('Reset task completion error:', error);
      return {
        success: false,
        error: 'Failed to reset task completion'
      };
    }
  }

  // Get task completion leaderboard
  async getTaskLeaderboard(limit: number = 10): Promise<ServiceResponse<{
    userId: string;
    completedTasks: number;
    totalPoints: number;
  }[]>> {
    try {
      const leaderboard = await prisma.taskCompletion.groupBy({
        by: ['userId'],
        where: {
          completedAt: { not: undefined }
        },
        _count: {
          taskId: true
        },
        orderBy: {
          _count: {
            taskId: 'desc'
          }
        },
        take: limit
      });

      // Get total points for each user
      const leaderboardWithPoints = await Promise.all(
        leaderboard.map(async (entry) => {
          const completions = await prisma.taskCompletion.findMany({
            where: {
              userId: entry.userId,
              completedAt: { not: undefined }
            },
            include: {
              task: true
            }
          });

          const totalPoints = completions.reduce((sum, completion) => {
            return sum + 0; // Points calculation simplified
          }, 0);

          return {
            userId: entry.userId,
            completedTasks: entry._count.taskId || 0,
            totalPoints
          };
        })
      );

      return {
        success: true,
        data: leaderboardWithPoints
      };
    } catch (error) {
      console.error('Get task leaderboard error:', error);
      return {
        success: false,
        error: 'Failed to get task leaderboard'
      };
    }
  }

  // Check if user has completed all required tasks for airdrop
  async checkAirdropEligibility(userId: string): Promise<ServiceResponse<{
    eligible: boolean;
    requiredTasks: string[];
    completedRequiredTasks: string[];
    missingTasks: string[];
  }>> {
    try {
      // Define required tasks for airdrop eligibility
      const requiredTaskIds = [
        'follow_twitter',
        'join_telegram',
        'join_discord',
        'retweet_post',
        'invite_friends'
      ];

      const completedTasks = await prisma.taskCompletion.findMany({
        where: {
          userId,
          taskId: { in: requiredTaskIds },
          completedAt: { not: undefined }
        }
      });

      const completedRequiredTasks = completedTasks.map(tc => tc.taskId);
      const missingTasks = requiredTaskIds.filter(taskId => 
        !completedRequiredTasks.includes(taskId)
      );

      const eligible = missingTasks.length === 0;

      return {
        success: true,
        data: {
          eligible,
          requiredTasks: requiredTaskIds,
          completedRequiredTasks,
          missingTasks
        }
      };
    } catch (error) {
      console.error('Check airdrop eligibility error:', error);
      return {
        success: false,
        error: 'Failed to check airdrop eligibility'
      };
    }
  }
}

// Export singleton instance
export const taskService = new TaskService();