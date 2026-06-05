import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import {
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
  ApiErroValidacao,
  ApiErroUuidInvalido,
  ApiErrosNaoPadronizados,
} from '@common/swagger/api-error-responses.decorator';
import { STOCK_RESPONSE_EXAMPLE } from '@common/swagger/error-examples';
import {
  AdjustStockDto,
  SetStockQuantityDto,
  UpdateStockDto,
} from '@stocks/dto/stock.dto';
import { StockResponseDto } from '@stocks/dto/stock-response.dto';
import { StockService } from '@stocks/stock.service';

@ApiTags('Estoque')
@ApiErrosNaoPadronizados()
@Controller({ path: 'stocks', version: '1' })
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar todos os estoques',
    description: 'Retorna o saldo e limites de estoque de todos os produtos cadastrados.',
  })
  @ApiOkResponse({
    description: 'Lista de registros de estoque',
    type: StockResponseDto,
    isArray: true,
    example: [STOCK_RESPONSE_EXAMPLE],
  })
  @ApiErroInterno()
  findAll(): Promise<StockResponseDto[]> {
    return this.stockService.findAll();
  }

  @Get('product/:productId')
  @ApiOperation({
    summary: 'Consultar estoque por produto',
    description:
      'Busca o estoque vinculado ao produto. Exige produto ativo; caso contrário retorna produto não encontrado.',
  })
  @ApiParam({
    name: 'productId',
    description: 'UUID do produto',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiOkResponse({
    description: 'Estoque do produto',
    type: StockResponseDto,
    example: STOCK_RESPONSE_EXAMPLE,
  })
  @ApiErroUuidInvalido()
  @ApiErroProdutoNaoEncontrado()
  @ApiErroEstoqueNaoEncontrado()
  @ApiErroInterno()
  findByProduct(
    @Param('productId', ParseUUIDPipe) productId: string,
  ): Promise<StockResponseDto> {
    return this.stockService.findByProductId(productId);
  }

  @Patch('product/:productId')
  @ApiOperation({
    summary: 'Atualizar limites de estoque',
    description:
      'Altera apenas `minimumQuantity` e/ou `maximumQuantity`. A quantidade atual é validada contra os novos limites.',
  })
  @ApiParam({
    name: 'productId',
    description: 'UUID do produto',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiOkResponse({
    description: 'Limites atualizados',
    type: StockResponseDto,
    example: {
      ...STOCK_RESPONSE_EXAMPLE,
      minimumQuantity: 15,
      maximumQuantity: 250,
    },
  })
  @ApiErroValidacao()
  @ApiErroUuidInvalido()
  @ApiErroProdutoNaoEncontrado()
  @ApiErroEstoqueNaoEncontrado()
  @ApiErroLimitesEstoque()
  @ApiErroInterno()
  updateLimits(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() dto: UpdateStockDto,
  ): Promise<StockResponseDto> {
    return this.stockService.updateLimits(productId, dto);
  }

  @Put('product/:productId/quantity')
  @ApiOperation({
    summary: 'Definir quantidade absoluta',
    description:
      'Substitui o saldo atual pela quantidade informada no corpo, respeitando mínimo e máximo configurados.',
  })
  @ApiParam({
    name: 'productId',
    description: 'UUID do produto',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiOkResponse({
    description: 'Quantidade definida',
    type: StockResponseDto,
    example: { ...STOCK_RESPONSE_EXAMPLE, quantity: 120 },
  })
  @ApiErroValidacao()
  @ApiErroUuidInvalido()
  @ApiErroProdutoNaoEncontrado()
  @ApiErroEstoqueNaoEncontrado()
  @ApiErroLimitesEstoque()
  @ApiErroInterno()
  setQuantity(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() dto: SetStockQuantityDto,
  ): Promise<StockResponseDto> {
    return this.stockService.setQuantity(productId, dto);
  }

  @Post('product/:productId/adjust')
  @ApiOperation({
    summary: 'Ajustar estoque (entrada ou saída)',
    description:
      'Aplica movimentação **IN** (soma) ou **OUT** (subtrai) sobre o saldo atual. Saídas que deixariam quantidade negativa retornam erro de estoque insuficiente.',
  })
  @ApiParam({
    name: 'productId',
    description: 'UUID do produto',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiOkResponse({
    description: 'Estoque ajustado',
    type: StockResponseDto,
    example: { ...STOCK_RESPONSE_EXAMPLE, quantity: 63 },
  })
  @ApiErroValidacao()
  @ApiErroUuidInvalido()
  @ApiErroProdutoNaoEncontrado()
  @ApiErroEstoqueNaoEncontrado()
  @ApiErroEstoqueInsuficiente()
  @ApiErroLimitesEstoque()
  @ApiErroInterno()
  adjust(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() dto: AdjustStockDto,
  ): Promise<StockResponseDto> {
    return this.stockService.adjust(productId, dto);
  }
}
