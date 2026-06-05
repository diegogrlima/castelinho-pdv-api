import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { ApiErrorResponse } from '@common/dto/api-error.response';
import { ERROR_EXAMPLES } from '@common/swagger/error-examples';

function jsonErrorResponse(
  status: HttpStatus,
  description: string,
  examples: Record<string, { summary: string; value: object }>,
) {
  return ApiResponse({
    status,
    description,
    type: ApiErrorResponse,
    content: {
      'application/json': { examples },
    },
  });
}

export function ApiErroValidacao() {
  return jsonErrorResponse(
    HttpStatus.BAD_REQUEST,
    'Corpo ou parâmetros inválidos conforme as regras de validação (class-validator).',
    { validacao: ERROR_EXAMPLES.validation },
  );
}

export function ApiErroUuidInvalido() {
  return jsonErrorResponse(
    HttpStatus.BAD_REQUEST,
    'Identificador no path não é um UUID válido (ParseUUIDPipe).',
    { uuidInvalido: ERROR_EXAMPLES.invalidUuid },
  );
}

export function ApiErroProdutoNaoEncontrado() {
  return jsonErrorResponse(
    HttpStatus.NOT_FOUND,
    'Produto inexistente ou inativo.',
    { produtoNaoEncontrado: ERROR_EXAMPLES.productNotFound },
  );
}

export function ApiErroEstoqueNaoEncontrado() {
  return jsonErrorResponse(
    HttpStatus.NOT_FOUND,
    'Não há registro de estoque para o produto informado.',
    { estoqueNaoEncontrado: ERROR_EXAMPLES.stockNotFound },
  );
}

export function ApiErroConflitoEstoque() {
  return jsonErrorResponse(
    HttpStatus.CONFLICT,
    'Já existe estoque vinculado ao produto (regra de negócio).',
    { estoqueJaExiste: ERROR_EXAMPLES.stockAlreadyExists },
  );
}

export function ApiErroEstoqueInsuficiente() {
  return jsonErrorResponse(
    HttpStatus.BAD_REQUEST,
    'Saída de estoque (OUT) deixaria a quantidade negativa.',
    { estoqueInsuficiente: ERROR_EXAMPLES.insufficientStock },
  );
}

export function ApiErroVendaNaoEncontrada() {
  return jsonErrorResponse(
    HttpStatus.NOT_FOUND,
    'Venda inexistente.',
    { vendaNaoEncontrada: ERROR_EXAMPLES.saleNotFound },
  );
}

export function ApiErroStatusVendaInvalido() {
  return jsonErrorResponse(
    HttpStatus.BAD_REQUEST,
    'Operação não permitida para o status atual da venda.',
    { statusVendaInvalido: ERROR_EXAMPLES.saleInvalidStatus },
  );
}

export function ApiErroLimitesEstoque() {
  return jsonErrorResponse(
    HttpStatus.BAD_REQUEST,
    'Limites ou quantidade violam as regras de estoque (mínimo, máximo ou quantidade atual).',
    {
      minimoNegativo: ERROR_EXAMPLES.invalidStockLimitsMinNegative,
      excedeMaximo: ERROR_EXAMPLES.invalidStockLimitsExceedsMax,
    },
  );
}

export function ApiErroInterno() {
  return jsonErrorResponse(
    HttpStatus.INTERNAL_SERVER_ERROR,
    'Falha inesperada não tratada explicitamente pela aplicação.',
    { erroInterno: ERROR_EXAMPLES.internalError },
  );
}

export function ApiErrosPadraoLeitura() {
  return applyDecorators(
    ApiErroUuidInvalido(),
    ApiErroProdutoNaoEncontrado(),
    ApiErroInterno(),
  );
}

export function ApiErrosPadraoEscrita() {
  return applyDecorators(
    ApiErroValidacao(),
    ApiErroUuidInvalido(),
    ApiErroProdutoNaoEncontrado(),
    ApiErroInterno(),
  );
}

export function ApiErrosPadraoEstoque() {
  return applyDecorators(
    ApiErroValidacao(),
    ApiErroUuidInvalido(),
    ApiErroProdutoNaoEncontrado(),
    ApiErroEstoqueNaoEncontrado(),
    ApiErroLimitesEstoque(),
    ApiErroInterno(),
  );
}

/** Erros possíveis hoje, porém sem código/mensagem padronizados pela aplicação. */
export function ApiErrosNaoPadronizados() {
  return applyDecorators(
    jsonErrorResponse(
      HttpStatus.TOO_MANY_REQUESTS,
      'Limite de requisições (ThrottlerGuard) — retorno genérico `HTTP_ERROR`.',
      { limiteRequisicoes: ERROR_EXAMPLES.throttle },
    ),
    jsonErrorResponse(
      HttpStatus.BAD_REQUEST,
      'JSON malformado no body — mensagem técnica do parser, código `BAD_REQUEST`.',
      { jsonMalformado: ERROR_EXAMPLES.malformedJson },
    ),
  );
}
