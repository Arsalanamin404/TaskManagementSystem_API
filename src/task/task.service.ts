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

@Injectable()
export class TaskService {
  constructor(private prisma: PrismaService) { }

  async createTask(data: CreateTaskDto) {
    if (data.assignedToUserId) {
      const user = await this.prisma.user.findUnique({
        where: { id: data.assignedToUserId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }
    }
    await this.prisma.task.create({
      data: {
        title: data.title,
        content: data.content,
        status: data.status,
        assignedToUserId: data.assignedToUserId ?? null,
      },
    });

    return { message: 'Task created successfully' };
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

    await this.prisma.task.update({
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

    return { message: 'Task assigned successfully' };
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

    await this.prisma.task.update({
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

    return { message: 'Task status updated successfully' };
  }

  async getTaskStatus(taskId: string) {
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    if (!task) {
      throw new NotFoundException(`Task with ID '${taskId}' not found`);
    }
    return { task_status: task.status };
  }
  async updateTask(id: string, data: UpdateTaskDto) {
    // First check if exists
    const task = await this.prisma.task.findUnique({ where: { id } });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return this.prisma.task.update({
      where: { id },
      data,
    });
  }

  async getTaskById(id: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: { assignedToUser: true },
    });
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return task;
  }

  async getTasksForUser(userId: string) {
    return this.prisma.task.findMany({
      where: { assignedToUserId: userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAllTasks({ page = 1, limit = 5 }: paginationDto) {
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
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getAllTaskTitles({ page = 1, limit = 5 }: paginationDto) {
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

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async deleteTask(id: string) {
    // First check if exists
    const task = await this.prisma.task.findUnique({ where: { id } });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return this.prisma.task.delete({ where: { id } });
  }
}
