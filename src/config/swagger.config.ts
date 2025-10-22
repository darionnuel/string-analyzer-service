import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

/**
 * Configure Swagger/OpenAPI documentation
 */
export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('String Analyzer Service API')
    .setDescription(
      `A RESTful API service that analyzes strings and stores their computed properties.
      
## Features
- String analysis with comprehensive properties computation
- Advanced filtering capabilities
- Natural language query support
- Full CRUD operations with proper validation

## String Properties
For each analyzed string, the service computes:
- **length**: Number of characters in the string
- **is_palindrome**: Boolean indicating if the string reads the same forwards and backwards (case-insensitive)
- **unique_characters**: Count of distinct characters in the string
- **word_count**: Number of words separated by whitespace
- **sha256_hash**: SHA-256 hash of the string for unique identification
- **character_frequency_map**: Object mapping each character to its occurrence count`,
    )
    .setVersion('1.0.0')
    .addTag('strings', 'String analysis and management operations')
    .setContact(
      'API Support',
      'https://github.com/yourusername/string-analyzer',
      'support@example.com',
    )
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addServer('http://localhost:3000', 'Development server')
    .addServer('https://api.example.com', 'Production server')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'String Analyzer API Docs',
    customfavIcon: 'https://nestjs.com/img/logo-small.svg',
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      showRequestHeaders: true,
      tryItOutEnabled: true,
    },
  });

  console.log(
    '📚 Swagger documentation available at: http://localhost:3000/api/docs',
  );
}
