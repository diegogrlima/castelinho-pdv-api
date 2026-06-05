import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import {
  ApiErroEstoqueInsuficiente,
  ApiErroEstoqueNaoEncontrado,
  ApiErroInterno,
  ApiErroLimitesEstoque,
  ApiErroProdutoNaoEncontrado,
  ApiErroStatusVendaInvalido,
  ApiErroValidacao,
  ApiErroUuidInvalido,
  ApiErroVendaNaoEncontrada,
  ApiErrosNaoPadronizados,
} from '@common/swagger/api-error-responses.decorator';
import { SALE_RESPONSE_EXAMPLE } from '@common/swagger/error-examples';
import { CreateSaleDto } from '@sales/dto/create-sale.dto';
import { SaleResponseDto } from '@sales/dto/sale-response.dto';
import { SaleService } from '@sales/sale.service';

@ApiTags('Vendas')
@ApiErrosNaoPadronizados()
@Controller({ path: 'sales', version: '1' })
export class SaleController {
  constructor(private readonly saleService: SaleService) {}

  @Post()
  @ApiOperation({
    summary: 'Registrar venda',
    description:
      'Cria uma venda com status **OPEN**, captura o preço atual de cada produto, **reserva estoque** e calcula totais.',
  })
  @ApiCreatedResponse({
    description: 'Venda registrada',
    type: SaleResponseDto,
    example: SALE_RESPONSE_EXAMPLE,
  })
  @ApiErroValidacao()
  @ApiErroProdutoNaoEncontrado()
  @ApiErroInterno()
  create(@Body() dto: CreateSaleDto): Promise<SaleResponseDto> {
    return this.saleService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar vendas',
    description: 'Retorna todas as vendas com seus itens, da mais recente para a mais antiga.',
  })
  @ApiOkResponse({
    description: 'Lista de vendas',
    type: SaleResponseDto,
    isArray: true,
    example: [SALE_RESPONSE_EXAMPLE],
  })
  @ApiErroInterno()
  findAll(): Promise<SaleResponseDto[]> {
    return this.saleService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar venda por ID',
    description: 'Obtém uma venda pelo UUID, incluindo itens e nomes dos produtos.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID da venda',
    example: '880e8400-e29b-41d4-a716-446655440003',
  })
  @ApiOkResponse({
    description: 'Venda encontrada',
    type: SaleResponseDto,
    example: SALE_RESPONSE_EXAMPLE,
  })
  @ApiErroUuidInvalido()
  @ApiErroVendaNaoEncontrada()
  @ApiErroInterno()
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<SaleResponseDto> {
    return this.saleService.findOne(id);
  }

  @Patch(':id/complete')
  @ApiOperation({
    summary: 'Concluir venda',
    description:
      'Finaliza uma venda **OPEN**, confirma a reserva de estoque (baixa efetiva) e altera o status para **COMPLETED** na mesma transação.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID da venda',
    example: '880e8400-e29b-41d4-a716-446655440003',
  })
  @ApiOkResponse({
    description: 'Venda concluída',
    type: SaleResponseDto,
    example: {
      ...SALE_RESPONSE_EXAMPLE,
      status: 'COMPLETED',
      updatedAt: '2024-06-01T10:05:00.000Z',
    },
  })
  @ApiErroUuidInvalido()
  @ApiErroVendaNaoEncontrada()
  @ApiErroStatusVendaInvalido()
  @ApiErroEstoqueNaoEncontrado()
  @ApiErroEstoqueInsuficiente()
  @ApiErroLimitesEstoque()
  @ApiErroInterno()
  complete(@Param('id', ParseUUIDPipe) id: string): Promise<SaleResponseDto> {
    return this.saleService.complete(id);
  }

  @Patch(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cancelar venda',
    description:
      'Cancela uma venda **OPEN**, libera a reserva de estoque e altera o status para **CANCELLED**. Vendas já concluídas ou canceladas retornam erro de status inválido.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID da venda',
    example: '880e8400-e29b-41d4-a716-446655440003',
  })
  @ApiOkResponse({
    description: 'Venda cancelada',
    type: SaleResponseDto,
    example: {
      ...SALE_RESPONSE_EXAMPLE,
      status: 'CANCELLED',
      updatedAt: '2024-06-01T10:05:00.000Z',
    },
  })
  @ApiErroUuidInvalido()
  @ApiErroVendaNaoEncontrada()
  @ApiErroStatusVendaInvalido()
  @ApiErroInterno()
  cancel(@Param('id', ParseUUIDPipe) id: string): Promise<SaleResponseDto> {
    return this.saleService.cancel(id);
  }
}
