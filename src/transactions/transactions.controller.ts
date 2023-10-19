import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { DeleteTransactionDto } from './dto/delete-transaction.dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}
  
  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Get all existing transactions.' })
  @ApiBearerAuth()
  getAll(@Request() req) {
    return this.transactionsService.getAll(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Get one transaction by id.' })
  @ApiBearerAuth()
  getOne(@Request() req, @Param('id') id: string) {
    return this.transactionsService.getOne(+id, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Create a new transaction.' })
  @ApiBearerAuth()
  create(@Request() req, @Body() createTransactionDto: CreateTransactionDto) {
    return this.transactionsService.create(createTransactionDto, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @ApiOperation({ summary: 'Update an existing transaction.' })
  @ApiBearerAuth()
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
  ) {
    return this.transactionsService.update(+id, updateTransactionDto, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete an existing transaction.' })
  @ApiBearerAuth()
  delete(
    @Request() req,
    @Param('id') id: string,
    @Body() deleteTransactionDto: DeleteTransactionDto,
  ) {
    return this.transactionsService.delete(+id, deleteTransactionDto, req.user.userId);
  }
}
