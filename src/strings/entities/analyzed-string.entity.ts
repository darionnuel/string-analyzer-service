import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { StringProperties } from '../interfaces/string-properties.interface';

/**
 * Entity representing an analyzed string in the database
 */
@Entity('analyzed_strings')
export class AnalyzedString {
  /**
   * Primary key: SHA-256 hash of the string value
   */
  @ApiProperty({
    description: 'SHA-256 hash of the string (used as primary key)',
    example: 'abc123def456...',
  })
  @PrimaryColumn({ type: 'varchar', length: 64 })
  id: string;

  /**
   * The actual string value being analyzed
   * Indexed and unique for fast lookups
   */
  @ApiProperty({
    description: 'The actual string value that was analyzed',
    example: 'hello world',
  })
  @Column({ type: 'text', unique: true })
  @Index()
  value: string;

  /**
   * Computed properties stored as JSONB for flexibility and querying
   */
  @ApiProperty({
    description: 'Computed properties of the string',
    example: {
      length: 11,
      is_palindrome: false,
      unique_characters: 8,
      word_count: 2,
      sha256_hash: 'abc123def456...',
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
  })
  @Column({ type: 'jsonb' })
  properties: StringProperties;

  /**
   * Timestamp when the string was first analyzed
   */
  @ApiProperty({
    description: 'Timestamp when the string was first analyzed',
    example: '2025-10-21T10:00:00Z',
  })
  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;
}
