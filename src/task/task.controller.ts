import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { paginationDto } from './dto/pagination.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { Roles } from 'src/auth/decorators/role.decorator';
import { Role } from 'src/generated/prisma/enums';
import { UpdateAssignedTaskStatusDto } from './dto/update-assigned-task-status.dto';
import { AssignTaskDto } from './dto/assign-task.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiNoContentResponse,
} from '@nestjs/swagger';
import { TaskResponseDto } from './dto/task-response.dto';
import { PaginatedTasksResponseDto } from './dto/paginated-task-response.dto';
import { PaginatedTaskTitlesResponseDto } from './dto/task-title-response.dto';

interface RequestWithUser extends Request {
  user: {
    sub: string;
    role: Role;
  };
}

@Controller('tasks')
@ApiBearerAuth('accessToken')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  // only admin can create tasks
  @Post()
  @ApiOperation({
    summary: 'Create a new task (Admin)',
    description: 'Creates a new task. Only admins can access this endpoint.',
  })
  @ApiCreatedResponse({
    description: 'Task created successfully.',
  })
  @ApiBadRequestResponse({ description: 'Validation error.' })
  @ApiUnauthorizedResponse({ description: 'User not authenticated.' })
  @ApiForbiddenResponse({ description: 'Only admin can create tasks.' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  createTask(@Body() data: CreateTaskDto) {
    return this.taskService.createTask(data);
  }

  // only admin can asign tasks to users
  @Post(':taskId/assign/:userId')
  @ApiOperation({
    summary: 'Assign a task to a user (Admin)',
    description: 'Assigns a task to a specific user. Admin only.',
  })
  @ApiOkResponse({
    description: 'Task assigned successfully.',
  })
  @ApiBadRequestResponse({ description: 'Invalid task or user ID.' })
  @ApiUnauthorizedResponse({ description: 'User not authenticated.' })
  @ApiForbiddenResponse({ description: 'Only admin can assign tasks.' })
  @ApiNotFoundResponse({ description: 'Task or user not found.' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @HttpCode(200)
  assignTask(
    @Param(new ValidationPipe({ transform: true }))
    params: AssignTaskDto,
  ) {
    return this.taskService.assignTaskToUser({
      taskId: params.taskId,
      assignedToUserId: params.assignedToUserId,
    });
  }

  @Patch(':taskId/status')
  @ApiOperation({
    summary: 'Update task status',
    description: 'Updates the status of a task assigned to the logged-in user.',
  })
  @ApiOkResponse({
    description: 'Task status updated successfully.',
  })
  @ApiBadRequestResponse({ description: 'Invalid status value.' })
  @ApiUnauthorizedResponse({ description: 'User not authenticated.' })
  @ApiForbiddenResponse({ description: 'Task not assigned to this user.' })
  @ApiNotFoundResponse({ description: 'Task not found.' })
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  updateTaskStatus(
    @Param('taskId') taskid: string,
    @Body() data: UpdateAssignedTaskStatusDto,
    @Req() req: RequestWithUser,
  ) {
    return this.taskService.updateAssignedTaskStatus(
      taskid,
      req.user.sub,
      data,
    );
  }

  @Get(':taskId/status')
  @ApiOperation({
    summary: 'Get task status (Admin)',
    description: 'Returns the current status of a task. Admin only.',
  })
  @ApiOkResponse({
    description: 'Task status fetched successfully.',
    type: UpdateAssignedTaskStatusDto,
  })
  @ApiUnauthorizedResponse({ description: 'User not authenticated.' })
  @ApiForbiddenResponse({ description: 'Only admin can view this status.' })
  @ApiNotFoundResponse({ description: 'Task not found.' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @HttpCode(200)
  GetTaskStatus(@Param('taskId') taskid: string) {
    return this.taskService.getTaskStatus(taskid);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update a task (Admin)',
    description: 'Updates task details by ID. Admin only.',
  })
  @ApiOkResponse({
    description: 'Task updated successfully.',
    type: TaskResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Validation error.' })
  @ApiUnauthorizedResponse({ description: 'User not authenticated.' })
  @ApiForbiddenResponse({ description: 'Only admin can update tasks.' })
  @ApiNotFoundResponse({ description: 'Task not found.' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  updateTask(@Param('id') id: string, @Body() data: UpdateTaskDto) {
    return this.taskService.updateTask(id, data);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all tasks (Admin)',
    description: 'Returns a paginated list of all tasks. Admin only.',
  })
  @ApiOkResponse({
    description: 'Tasks fetched successfully.',
    type: PaginatedTasksResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'User not authenticated.' })
  @ApiForbiddenResponse({ description: 'Only admin can view all tasks.' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  getAllTasks(
    @Query(new ValidationPipe({ transform: true })) query: paginationDto,
  ) {
    return this.taskService.getAllTasks(query);
  }

  @Get('me')
  @ApiOperation({
    summary: 'Update a task (Admin)',
    description: 'Updates task details by ID. Admin only.',
  })
  @ApiOkResponse({
    description: 'Task updated successfully.',
    type: TaskResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Validation error.' })
  @ApiUnauthorizedResponse({ description: 'User not authenticated.' })
  @ApiForbiddenResponse({ description: 'Only admin can update tasks.' })
  @ApiNotFoundResponse({ description: 'Task not found.' })
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  getMyTasks(@Req() req: RequestWithUser) {
    return this.taskService.getTasksForUser(req.user.sub);
  }

  @Get('titles')
  @ApiOperation({
    summary: 'Get all task titles',
    description:
      'Returns a paginated list of task titles for quick selection/filtering.',
  })
  @ApiOkResponse({
    description: 'Task titles fetched successfully.',
    type: PaginatedTaskTitlesResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'User not authenticated.' })
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  getAllTaskTitles(
    @Query(new ValidationPipe({ transform: true })) query: paginationDto,
  ) {
    return this.taskService.getAllTaskTitles(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get task by ID',
    description: 'Returns task details by ID for an authenticated user.',
  })
  @ApiOkResponse({
    description: 'Task fetched successfully.',
    type: TaskResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'User not authenticated.' })
  @ApiNotFoundResponse({ description: 'Task not found.' })
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  getTask(@Param('id') id: string) {
    return this.taskService.getTaskById(id);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete task (Admin)',
    description: 'Deletes a task by ID. Admin only.',
  })
  @ApiNoContentResponse({
    description: 'Task deleted successfully.',
  })
  @ApiUnauthorizedResponse({ description: 'User not authenticated.' })
  @ApiForbiddenResponse({ description: 'Only admin can delete tasks.' })
  @ApiNotFoundResponse({ description: 'Task not found.' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  async deleteTask(@Param('id') id: string) {
    return this.taskService.deleteTask(id);
  }
}
