import {
  IsOptional,
  IsBoolean,
  IsInt,
  Min,
  IsString,
  Length,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for filtering strings with various criteria
 */
export class FilterStringsDto {
  /**
   * Filter by palindrome property
   */
  @ApiPropertyOptional({
    description: 'Filter by palindrome status',
    example: true,
    type: Boolean,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean({ message: 'is_palindrome must be a boolean (true/false)' })
  is_palindrome?: boolean;

  /**
   * Minimum string length (inclusive)
   */
  @ApiPropertyOptional({
    description: 'Minimum string length (inclusive)',
    example: 5,
    type: Number,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'min_length must be an integer' })
  @Min(0, { message: 'min_length must be at least 0' })
  min_length?: number;

  /**
   * Maximum string length (inclusive)
   */
  @ApiPropertyOptional({
    description: 'Maximum string length (inclusive)',
    example: 20,
    type: Number,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'max_length must be an integer' })
  @Min(0, { message: 'max_length must be at least 0' })
  max_length?: number;

  /**
   * Exact word count to match
   */
  @ApiPropertyOptional({
    description: 'Exact word count to match',
    example: 2,
    type: Number,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'word_count must be an integer' })
  @Min(0, { message: 'word_count must be at least 0' })
  word_count?: number;

  /**
   * Single character that must be present in the string
   */
  @ApiPropertyOptional({
    description: 'Single character that must be present in the string',
    example: 'a',
    type: String,
    minLength: 1,
    maxLength: 1,
  })
  @IsOptional()
  @IsString({ message: 'contains_character must be a string' })
  @Length(1, 1, { message: 'contains_character must be exactly one character' })
  contains_character?: string;
}
