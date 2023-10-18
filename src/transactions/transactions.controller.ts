import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { DeleteTransactionDto } from './dto/delete-transaction.dto';
import { ApiOperation } from '@nestjs/swagger';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all existing transactions.' })
  getAll() {
    return this.transactionsService.getAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one transaction by id.' })
  getOne(@Param('id') id: string) {
    return this.transactionsService.getOne(+id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new transaction.' })
  create(@Body() createTransactionDto: CreateTransactionDto) {
    return this.transactionsService.create(createTransactionDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an existing transaction.' })
  update(
    @Param('id') id: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
  ) {
    return this.transactionsService.update(+id, updateTransactionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an existing transaction.' })
  delete(
    @Param('id') id: string,
    @Body() deleteTransactionDto: DeleteTransactionDto,
  ) {
    return this.transactionsService.delete(+id, deleteTransactionDto);
  }
}
