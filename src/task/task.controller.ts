import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { paginationDto } from './dto/pagination.dto';

@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createTask(@Body() data: CreateTaskDto) {
    return this.taskService.createTask(data);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  updateTask(@Param('id') id: string, @Body() data: UpdateTaskDto) {
    return this.taskService.updateTask(id, data);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  getAllTasks(
    @Query(new ValidationPipe({ transform: true })) query: paginationDto,
  ) {
    return this.taskService.getAllTasks(query);
  }

  @Get('/titles')
  @HttpCode(HttpStatus.OK)
  getAllTaskTitles(
    @Query(new ValidationPipe({ transform: true })) query: paginationDto,
  ) {
    return this.taskService.getAllTaskTitles(query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  getTask(@Param('id') id: string) {
    return this.taskService.getTaskById(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteTask(@Param('id') id: string) {
    return this.taskService.deleteTask(id);
  }
}
