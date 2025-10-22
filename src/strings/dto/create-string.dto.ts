import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for creating/analyzing a new string
 */
export class CreateStringDto {
  /**
   * The string value to be analyzed
   * Must be a non-empty string
   */
  @ApiProperty({
    description: 'The string value to be analyzed',
    example: 'hello world',
    type: String,
    required: true,
  })
  @IsString({ message: 'Value must be a string' })
  @IsNotEmpty({ message: 'Value field is required' })
  value: string;
}
