import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { paginationDto } from './dto/pagination.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { AssignTaskDto } from './dto/assign-task.dto';
import { UpdateAssignedTaskStatusDto } from './dto/update-assigned-task-status.dto';
import { Status } from 'src/generated/prisma/enums';
import { CacheService } from 'src/cache/cache.service';

@Injectable()
export class TaskService {
  constructor(
    private prisma: PrismaService,
    private readonly cache: CacheService,
  ) { }

  async createTask(data: CreateTaskDto) {
    if (data.assignedToUserId) {
      const user = await this.prisma.user.findUnique({
        where: { id: data.assignedToUserId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }
    }
    const created_task = await this.prisma.task.create({
      data: {
        title: data.title,
        content: data.content,
        status: data.status,
        assignedToUserId: data.assignedToUserId ?? null,
      },
    });

    // if task is assigned, clear that user's task list cache
    if (created_task.assignedToUserId) {
      await this.cache.delete(
        this.cache.buildKey('tasks:user:', created_task.assignedToUserId),
      );
    }

    return { message: 'Task created successfully', task: created_task };
  }

  async assignTaskToUser(data: AssignTaskDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: data.assignedToUserId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const task = await this.prisma.task.findUnique({
      where: { id: data.taskId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const updatedTask = await this.prisma.task.update({
      where: { id: data.taskId },
      data: { assignedToUserId: data.assignedToUserId, assignedAt: new Date() },
      include: {
        assignedToUser: {
          select: {
            name: true,
            email: true,
            tasks: true,
            role: true,
          },
        },
      },
    });

    await this.cache.delete(this.cache.buildKey('tasks:', data.taskId));
    await this.cache.delete(this.cache.buildKey('tasks:status:', data.taskId));

    // clear old assigned user's list cache (if existed)
    if (task.assignedToUserId) {
      await this.cache.delete(
        this.cache.buildKey('tasks:user:', task.assignedToUserId),
      );
    }

    // clear new assigned user's list cache
    if (data.assignedToUserId) {
      await this.cache.delete(
        this.cache.buildKey('tasks:user:', data.assignedToUserId),
      );
    }
    return { message: 'Task assigned successfully', task: updatedTask };
  }

  async updateAssignedTaskStatus(
    taskId: string,
    userId: string,
    data: UpdateAssignedTaskStatusDto,
  ) {
    const task = await this.prisma.task.findFirst({
      where: {
        id: taskId,
        assignedToUserId: userId,
      },
    });

    if (!task) {
      throw new ForbiddenException('You are not allowed to update this task');
    }

    const isCompleted = data.status === Status.COMPLETED;

    const updatedTask = await this.prisma.task.update({
      where: { id: taskId },
      data: {
        status: data.status,
        completedAt: isCompleted ? new Date() : null,
      },
      include: {
        assignedToUser: {
          select: {
            name: true,
            email: true,
            tasks: true,
            role: true,
          },
        },
      },
    });

    // clear per-task caches
    await this.cache.delete(this.cache.buildKey('tasks:', taskId));
    await this.cache.delete(this.cache.buildKey('tasks:status:', taskId));

    // clear this user's tasks list cache
    if (task.assignedToUserId) {
      await this.cache.delete(
        this.cache.buildKey('tasks:user:', task.assignedToUserId),
      );
    }
    return { message: 'Task status updated successfully', task: updatedTask };
  }

  async getTaskStatus(taskId: string) {
    const cacheKey = this.cache.buildKey('tasks:status:', taskId);
    return this.cache.wrap(
      cacheKey,
      async () => {
        const task = await this.prisma.task.findUnique({
          where: { id: taskId },
        });
        if (!task) {
          throw new NotFoundException(`Task with ID '${taskId}' not found`);
        }
        return { task_status: task.status };
      },
      3 * 60 * 1000,
    );
  }
  async updateTask(id: string, data: UpdateTaskDto) {
    // First check if exists
    const task = await this.prisma.task.findUnique({ where: { id } });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    const updated = await this.prisma.task.update({
      where: { id },
      data,
    });

    // clear per-task caches
    await this.cache.delete(this.cache.buildKey('tasks:', id));
    await this.cache.delete(this.cache.buildKey('tasks:status:', id));

    // clear old user's cache if task was assigned before
    if (task.assignedToUserId) {
      await this.cache.delete(
        this.cache.buildKey('tasks:user:', task.assignedToUserId),
      );
    }

    if (
      updated.assignedToUserId &&
      updated.assignedToUserId !== task.assignedToUserId
    ) {
      await this.cache.delete(
        this.cache.buildKey('tasks:user:', updated.assignedToUserId),
      );
    }

    return { task: updated };
  }

  async getTaskById(id: string) {
    const cacheKey = this.cache.buildKey('tasks:', id);

    return this.cache.wrap(
      cacheKey,
      async () => {
        const task = await this.prisma.task.findUnique({
          where: { id },
          include: { assignedToUser: true },
        });

        if (!task) {
          throw new NotFoundException(`Task with ID ${id} not found`);
        }
        return task;
      },
      60000, //cache result for 60 seconds
    );
  }

  async getTasksForUser(userId: string) {
    const cacheKey = this.cache.buildKey('tasks:user:', userId);
    return this.cache.wrap(
      cacheKey,
      async () => {
        return this.prisma.task.findMany({
          where: { assignedToUserId: userId },
          orderBy: { createdAt: 'desc' },
        });
      },
      60000,
    );
  }

  async getAllTasks({ page = 1, limit = 5 }: paginationDto) {
    const cacheKey = this.cache.buildKey(
      `tasks:all:`,
      `page=${page}:limit=${limit}`,
    );

    return this.cache.wrap(
      cacheKey,
      async () => {
        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
          this.prisma.task.findMany({
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: { assignedToUser: true },
          }),
          this.prisma.task.count(),
        ]);
        return {
          data,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        };
      },
      60000,
    );
  }

  async getAllTaskTitles({ page = 1, limit = 5 }: paginationDto) {
    const cacheKey = this.cache.buildKey(
      `tasks:titles:`,
      `page=${page}:limit=${limit}`,
    );
    return this.cache.wrap(
      cacheKey,
      async () => {
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
          this.prisma.task.findMany({
            skip,
            take: limit,
            select: {
              title: true,
            },
            orderBy: {
              createdAt: 'desc',
            },
          }),
          this.prisma.task.count(),
        ]);

        return {
          data,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        };
      },
      5 * 60 * 1000, //cache for 5 mins
    );
  }

  async deleteTask(id: string) {
    const task = await this.prisma.task.findUnique({ where: { id } });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    const deletedTask = await this.prisma.task.delete({ where: { id } });

    await this.cache.delete(this.cache.buildKey('tasks:', id));
    await this.cache.delete(this.cache.buildKey('tasks:status:', id));

    if (task.assignedToUserId) {
      await this.cache.delete(
        this.cache.buildKey('tasks:user:', task.assignedToUserId),
      );
    }

    return { message: 'Task deleted successfully', task: deletedTask };
  }
}
