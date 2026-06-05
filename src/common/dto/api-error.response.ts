import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ApiErrorResponse {
  @ApiProperty({
    description: 'Código HTTP da resposta',
    example: 400,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Código estável de erro da aplicação',
    example: 'VALIDATION_ERROR',
  })
  code: string;

  @ApiProperty({
    description: 'Mensagem legível em português para o cliente',
    example: 'Dados inválidos',
  })
  message: string;

  @ApiProperty({
    description: 'Caminho da requisição que gerou o erro',
    example: '/v1/products',
  })
  path: string;

  @ApiProperty({
    description: 'Data/hora do erro em ISO-8601',
    example: '2024-06-15T14:30:00.000Z',
  })
  timestamp: string;

  @ApiPropertyOptional({
    description:
      'Lista de mensagens de validação por campo (quando aplicável)',
    example: ['name should not be empty', 'price must not be less than 0'],
    type: [String],
  })
  fieldErrors?: string[];

  constructor(params: {
    statusCode: number;
    code: string;
    message: string;
    path: string;
    fieldErrors?: string[];
  }) {
    this.statusCode = params.statusCode;
    this.code = params.code;
    this.message = params.message;
    this.path = params.path;
    this.timestamp = new Date().toISOString();
    this.fieldErrors = params.fieldErrors;
  }
}
