import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { paginationDto } from './dto/pagination.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TaskService {
  constructor(private prisma: PrismaService) { }

  async createTask(data: CreateTaskDto) {
    return this.prisma.task.create({
      data,
    });
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
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return task;
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
