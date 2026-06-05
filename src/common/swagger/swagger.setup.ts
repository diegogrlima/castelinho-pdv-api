import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('PDV — API de Produtos e Estoque')
    .setVersion('1.0.0')
    .addTag(
      'Produtos',
      'Cadastro e manutenção de produtos do catálogo (soft delete).',
    )
    .addTag(
      'Estoque',
      'Consulta e movimentação de quantidades e limites de estoque por produto.',
    )
    .addTag('Saúde', 'Verificação de disponibilidade da API (sem autenticação).')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    customSiteTitle: 'PDV — Documentação da API',
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'list',
      filter: true,
      displayRequestDuration: true,
    },
  });
}
