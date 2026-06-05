import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { HealthResponseDto } from '@common/health/dto/health-response.dto';
import { ApiErrosNaoPadronizados } from '@common/swagger/api-error-responses.decorator';

@ApiTags('Saúde')
@ApiErrosNaoPadronizados()
@Controller({ path: 'health', version: VERSION_NEUTRAL })
export class HealthController {
  @Get()
  @ApiOperation({
    summary: 'Verificar saúde da API',
    description:
      'Endpoint simples para load balancers e monitoramento. Não exige autenticação nem versão `/v1`.',
  })
  @ApiOkResponse({
    description: 'API disponível',
    type: HealthResponseDto,
    example: { status: 'ok' },
  })
  check(): HealthResponseDto {
    return { status: 'ok' };
  }
}
