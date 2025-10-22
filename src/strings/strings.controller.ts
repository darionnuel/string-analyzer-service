import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { StringsService } from './strings.service';
import { CreateStringDto } from './dto/create-string.dto';
import { FilterStringsDto } from './dto/filter-strings.dto';
import { AnalyzedString } from './entities/analyzed-string.entity';

@ApiTags('strings')
@Controller('strings')
export class StringsController {
  constructor(private readonly stringsService: StringsService) {}

  /**
   * POST /strings
   * Create and analyze a new string
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create and analyze a new string',
    description:
      'Analyzes a string and stores its computed properties including length, palindrome check, unique characters, word count, SHA-256 hash, and character frequency map.',
  })
  @ApiBody({
    type: CreateStringDto,
    description: 'String to be analyzed',
    examples: {
      simple: {
        summary: 'Simple string',
        value: { value: 'hello world' },
      },
      palindrome: {
        summary: 'Palindrome string',
        value: { value: 'racecar' },
      },
      multiword: {
        summary: 'Multiple words',
        value: { value: 'A man a plan a canal Panama' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'String successfully created and analyzed',
    type: AnalyzedString,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid request body or missing "value" field',
    schema: {
      example: {
        statusCode: 400,
        message: ['value must be a string', 'value should not be empty'],
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - String already exists in the system',
    schema: {
      example: {
        statusCode: 409,
        message: 'String already exists in the system',
        error: 'Conflict',
      },
    },
  })
  @ApiResponse({
    status: 422,
    description:
      'Unprocessable Entity - Invalid data type for "value" (must be string)',
    schema: {
      example: {
        statusCode: 422,
        message: 'Value must be a string',
        error: 'Unprocessable Entity',
      },
    },
  })
  async create(
    @Body() createStringDto: CreateStringDto,
  ): Promise<AnalyzedString> {
    return await this.stringsService.create(createStringDto);
  }

  /**
   * GET /strings/filter-by-natural-language?query=...
   * Filter strings using natural language query
   */
  @Get('filter-by-natural-language')
  @ApiOperation({
    summary: 'Filter strings using natural language query',
    description: `Filter strings using human-readable queries. The system intelligently parses natural language and converts it into structured filters.
    
**Supported query patterns:**
- "all single word palindromic strings" → word_count=1, is_palindrome=true
- "strings longer than 10 characters" → min_length=11
- "palindromic strings that contain the letter z" → is_palindrome=true, contains_character=z
- "strings containing the letter a" → contains_character=a
- "two word strings" → word_count=2`,
  })
  @ApiQuery({
    name: 'query',
    required: true,
    description: 'Natural language query string',
    example: 'all single word palindromic strings',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully filtered strings with interpreted query',
    schema: {
      example: {
        data: [
          {
            id: 'abc123...',
            value: 'racecar',
            properties: {
              length: 7,
              is_palindrome: true,
              unique_characters: 4,
              word_count: 1,
              sha256_hash: 'abc123...',
              character_frequency_map: { r: 2, a: 2, c: 2, e: 1 },
            },
            created_at: '2025-10-21T10:00:00Z',
          },
        ],
        count: 1,
        interpreted_query: {
          original: 'all single word palindromic strings',
          parsed_filters: {
            word_count: 1,
            is_palindrome: true,
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Unable to parse natural language query',
  })
  @ApiResponse({
    status: 422,
    description:
      'Unprocessable Entity - Query parsed but resulted in conflicting filters',
  })
  async filterByNaturalLanguage(@Query('query') query: string) {
    return await this.stringsService.filterByNaturalLanguage(query);
  }

  /**
   * GET /strings/:value
   * Get a specific string by its value
   */
  @Get(':value')
  @ApiOperation({
    summary: 'Get a specific string by its value',
    description:
      'Retrieves a previously analyzed string and its computed properties.',
  })
  @ApiParam({
    name: 'value',
    description: 'The string value to retrieve',
    example: 'hello world',
  })
  @ApiResponse({
    status: 200,
    description: 'String found and returned',
    type: AnalyzedString,
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - String does not exist in the system',
    schema: {
      example: {
        statusCode: 404,
        message: 'String does not exist in the system',
        error: 'Not Found',
      },
    },
  })
  async findOne(@Param('value') value: string): Promise<AnalyzedString> {
    return await this.stringsService.findByValue(value);
  }

  /**
   * GET /strings?is_palindrome=true&min_length=5&...
   * Get all strings with optional filtering
   */
  @Get()
  @ApiOperation({
    summary: 'Get all strings with optional filtering',
    description:
      'Retrieves all analyzed strings with optional filters for palindrome status, length range, word count, and character containment.',
  })
  @ApiQuery({
    name: 'is_palindrome',
    required: false,
    type: Boolean,
    description: 'Filter by palindrome status (true/false)',
    example: true,
  })
  @ApiQuery({
    name: 'min_length',
    required: false,
    type: Number,
    description: 'Minimum string length (inclusive)',
    example: 5,
  })
  @ApiQuery({
    name: 'max_length',
    required: false,
    type: Number,
    description: 'Maximum string length (inclusive)',
    example: 20,
  })
  @ApiQuery({
    name: 'word_count',
    required: false,
    type: Number,
    description: 'Exact word count to match',
    example: 2,
  })
  @ApiQuery({
    name: 'contains_character',
    required: false,
    type: String,
    description: 'Single character that must be present in the string',
    example: 'a',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved strings',
    schema: {
      example: {
        data: [
          {
            id: 'abc123...',
            value: 'hello world',
            properties: {
              length: 11,
              is_palindrome: false,
              unique_characters: 8,
              word_count: 2,
              sha256_hash: 'abc123...',
              character_frequency_map: {
                h: 1,
                e: 1,
                l: 3,
                o: 2,
                ' ': 1,
                w: 1,
                r: 1,
                d: 1,
              },
            },
            created_at: '2025-10-21T10:00:00Z',
          },
        ],
        count: 1,
        filters_applied: {
          is_palindrome: false,
          min_length: 5,
          word_count: 2,
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid query parameter values or types',
  })
  async findAll(@Query() filters: FilterStringsDto) {
    return await this.stringsService.findAll(filters);
  }

  /**
   * DELETE /strings/:value
   * Delete a string by its value
   */
  @Delete(':value')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a string by its value',
    description:
      'Permanently removes a string and its computed properties from the system.',
  })
  @ApiParam({
    name: 'value',
    description: 'The string value to delete',
    example: 'hello world',
  })
  @ApiResponse({
    status: 204,
    description: 'String successfully deleted (no content returned)',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - String does not exist in the system',
    schema: {
      example: {
        statusCode: 404,
        message: 'String does not exist in the system',
        error: 'Not Found',
      },
    },
  })
  async delete(@Param('value') value: string): Promise<void> {
    await this.stringsService.delete(value);
  }
}
