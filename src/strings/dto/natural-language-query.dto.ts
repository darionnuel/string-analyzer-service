import { IsString, IsNotEmpty, MinLength } from 'class-validator';

/**
 * DTO for natural language query filtering
 */
export class NaturalLanguageQueryDto {
  /**
   * Natural language query string to be parsed
   * Examples:
   * - "all single word palindromic strings"
   * - "strings longer than 10 characters"
   * - "palindromic strings that contain the letter z"
   */
  @IsString({ message: 'Query must be a string' })
  @IsNotEmpty({ message: 'Query cannot be empty' })
  @MinLength(3, { message: 'Query must be at least 3 characters long' })
  query: string;
}
