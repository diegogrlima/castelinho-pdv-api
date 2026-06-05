import { ErrorCode } from '@common/errors/error-codes';

export const ERROR_EXAMPLES = {
  validation: {
    summary: 'Dados inválidos (validação)',
    value: {
      statusCode: 400,
      code: ErrorCode.VALIDATION_ERROR,
      message: 'Dados inválidos',
      path: '/v1/products',
      timestamp: '2024-06-15T14:30:00.000Z',
      fieldErrors: [
        'name should not be empty',
        'price must not be less than 0',
      ],
    },
  },
  invalidUuid: {
    summary: 'Identificador UUID inválido',
    value: {
      statusCode: 400,
      code: ErrorCode.BAD_REQUEST,
      message: 'Validation failed (uuid is expected)',
      path: '/v1/products/id-invalido',
      timestamp: '2024-06-15T14:30:00.000Z',
    },
  },
  productNotFound: {
    summary: 'Produto não encontrado',
    value: {
      statusCode: 404,
      code: ErrorCode.PRODUCT_NOT_FOUND,
      message: 'Produto não encontrado',
      path: '/v1/products/550e8400-e29b-41d4-a716-446655440000',
      timestamp: '2024-06-15T14:30:00.000Z',
    },
  },
  stockNotFound: {
    summary: 'Estoque não encontrado',
    value: {
      statusCode: 404,
      code: ErrorCode.STOCK_NOT_FOUND,
      message: 'Estoque não encontrado para este produto',
      path: '/v1/stocks/product/550e8400-e29b-41d4-a716-446655440000',
      timestamp: '2024-06-15T14:30:00.000Z',
    },
  },
  stockAlreadyExists: {
    summary: 'Estoque já cadastrado',
    value: {
      statusCode: 409,
      code: ErrorCode.STOCK_ALREADY_EXISTS,
      message: 'Estoque já existe para este produto',
      path: '/v1/stocks/product/550e8400-e29b-41d4-a716-446655440000',
      timestamp: '2024-06-15T14:30:00.000Z',
    },
  },
  insufficientStock: {
    summary: 'Quantidade insuficiente',
    value: {
      statusCode: 400,
      code: ErrorCode.INSUFFICIENT_STOCK,
      message: 'Quantidade insuficiente em estoque',
      path: '/v1/stocks/product/550e8400-e29b-41d4-a716-446655440000/adjust',
      timestamp: '2024-06-15T14:30:00.000Z',
    },
  },
  invalidStockLimitsMinNegative: {
    summary: 'Limite mínimo negativo',
    value: {
      statusCode: 400,
      code: ErrorCode.INVALID_STOCK_LIMITS,
      message: 'Quantidade mínima não pode ser negativa',
      path: '/v1/stocks/product/550e8400-e29b-41d4-a716-446655440000',
      timestamp: '2024-06-15T14:30:00.000Z',
    },
  },
  invalidStockLimitsExceedsMax: {
    summary: 'Quantidade acima do máximo',
    value: {
      statusCode: 400,
      code: ErrorCode.INVALID_STOCK_LIMITS,
      message: 'Quantidade excede o limite máximo de estoque',
      path: '/v1/stocks/product/550e8400-e29b-41d4-a716-446655440000/quantity',
      timestamp: '2024-06-15T14:30:00.000Z',
    },
  },
  saleNotFound: {
    summary: 'Venda não encontrada',
    value: {
      statusCode: 404,
      code: ErrorCode.SALE_NOT_FOUND,
      message: 'Venda não encontrada',
      path: '/v1/sales/880e8400-e29b-41d4-a716-446655440003',
      timestamp: '2024-06-15T14:30:00.000Z',
    },
  },
  saleInvalidStatus: {
    summary: 'Status da venda inválido para a operação',
    value: {
      statusCode: 400,
      code: ErrorCode.SALE_INVALID_STATUS,
      message: 'Apenas vendas abertas podem ser concluídas',
      path: '/v1/sales/880e8400-e29b-41d4-a716-446655440003/complete',
      timestamp: '2024-06-15T14:30:00.000Z',
    },
  },
  internalError: {
    summary: 'Erro interno inesperado',
    value: {
      statusCode: 500,
      code: ErrorCode.INTERNAL_ERROR,
      message: 'Não foi possível processar a solicitação',
      path: '/v1/products',
      timestamp: '2024-06-15T14:30:00.000Z',
    },
  },
  throttle: {
    summary: 'Limite de requisições excedido (não padronizado)',
    value: {
      statusCode: 429,
      code: ErrorCode.HTTP_ERROR,
      message: 'ThrottlerException: Too Many Requests',
      path: '/v1/products',
      timestamp: '2024-06-15T14:30:00.000Z',
    },
  },
  malformedJson: {
    summary: 'JSON malformado (não padronizado)',
    value: {
      statusCode: 400,
      code: ErrorCode.BAD_REQUEST,
      message: 'Unexpected token } in JSON at position 42',
      path: '/v1/products',
      timestamp: '2024-06-15T14:30:00.000Z',
    },
  },
} as const;

export const PRODUCT_RESPONSE_EXAMPLE = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  name: 'Café Especial 250g',
  description: 'Grãos torrados e moídos na hora',
  price: 29.9,
  active: true,
  createdAt: '2024-06-01T10:00:00.000Z',
  updatedAt: '2024-06-01T10:00:00.000Z',
};

export const SALE_RESPONSE_EXAMPLE = {
  id: '880e8400-e29b-41d4-a716-446655440003',
  code: 'VND-M5K2ABCD',
  total: 59.8,
  status: 'OPEN',
  items: [
    {
      id: '770e8400-e29b-41d4-a716-446655440002',
      productId: '550e8400-e29b-41d4-a716-446655440000',
      productName: 'Café Especial 250g',
      quantity: 2,
      unitPrice: 29.9,
      subtotal: 59.8,
    },
  ],
  createdAt: '2024-06-01T10:00:00.000Z',
  updatedAt: '2024-06-01T10:00:00.000Z',
};

export const STOCK_RESPONSE_EXAMPLE = {
  id: '660e8400-e29b-41d4-a716-446655440001',
  productId: '550e8400-e29b-41d4-a716-446655440000',
  quantity: 48,
  minimumQuantity: 10,
  maximumQuantity: 200,
  lowStock: false,
  createdAt: '2024-06-01T10:00:00.000Z',
  updatedAt: '2024-06-15T14:30:00.000Z',
};
