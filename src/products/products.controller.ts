import {
  Body,
  Controller,
  Delete,
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
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import {
  ApiErroInterno,
  ApiErroProdutoNaoEncontrado,
  ApiErroValidacao,
  ApiErroUuidInvalido,
  ApiErrosNaoPadronizados,
} from '@common/swagger/api-error-responses.decorator';
import {
  PRODUCT_RESPONSE_EXAMPLE,
} from '@common/swagger/error-examples';
import { CreateProductDto } from '@products/dto/create-product.dto';
import { ProductResponseDto } from '@products/dto/product-response.dto';
import { UpdateProductDto } from '@products/dto/update-product.dto';
import { ProductsService } from '@products/products.service';

@ApiTags('Produtos')
@ApiErrosNaoPadronizados()
@Controller({ path: 'products', version: '1' })
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({
    summary: 'Cadastrar produto',
    description:
      'Cria um produto ativo e, na mesma transação, o registro de estoque inicial com as quantidades informadas (ou zero).',
  })
  @ApiCreatedResponse({
    description: 'Produto criado com sucesso',
    type: ProductResponseDto,
    example: PRODUCT_RESPONSE_EXAMPLE,
  })
  @ApiErroValidacao()
  @ApiErroInterno()
  create(@Body() dto: CreateProductDto): Promise<ProductResponseDto> {
    return this.productsService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar produtos ativos',
    description:
      'Retorna todos os produtos com flag `active = true`, ordenados por criação.',
  })
  @ApiOkResponse({
    description: 'Lista de produtos ativos',
    type: ProductResponseDto,
    isArray: true,
    example: [PRODUCT_RESPONSE_EXAMPLE],
  })
  @ApiErroInterno()
  findAll(): Promise<ProductResponseDto[]> {
    return this.productsService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar produto por ID',
    description:
      'Obtém um produto ativo pelo UUID. Produtos inativos (removidos) respondem como não encontrados.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID do produto',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiOkResponse({
    description: 'Produto encontrado',
    type: ProductResponseDto,
    example: PRODUCT_RESPONSE_EXAMPLE,
  })
  @ApiErroUuidInvalido()
  @ApiErroProdutoNaoEncontrado()
  @ApiErroInterno()
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<ProductResponseDto> {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Atualizar produto',
    description:
      'Atualização parcial de nome, descrição e preço. Campos omitidos permanecem inalterados. Não altera estoque.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID do produto',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiOkResponse({
    description: 'Produto atualizado',
    type: ProductResponseDto,
    example: {
      ...PRODUCT_RESPONSE_EXAMPLE,
      name: 'Café Especial 500g',
      price: 49.9,
      updatedAt: '2024-06-15T14:30:00.000Z',
    },
  })
  @ApiErroValidacao()
  @ApiErroUuidInvalido()
  @ApiErroProdutoNaoEncontrado()
  @ApiErroInterno()
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    return this.productsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Desativar produto (soft delete)',
    description:
      'Marca o produto como inativo (`active = false`). Se já estiver inativo, responde **204** sem erro. Não remove o registro de estoque do banco.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID do produto',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiNoContentResponse({
    description: 'Produto desativado ou já estava inativo',
  })
  @ApiErroUuidInvalido()
  @ApiErroProdutoNaoEncontrado()
  @ApiErroInterno()
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.productsService.remove(id);
  }
}
