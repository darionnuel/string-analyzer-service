import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createHash } from 'crypto';
import { AnalyzedString } from './entities/analyzed-string.entity';
import { CreateStringDto } from './dto/create-string.dto';
import { FilterStringsDto } from './dto/filter-strings.dto';
import { StringProperties } from './interfaces/string-properties.interface';

@Injectable()
export class StringsService {
  constructor(
    @InjectRepository(AnalyzedString)
    private readonly stringRepository: Repository<AnalyzedString>,
  ) {}

  /**
   * Compute all properties for a given string
   */
  private computeProperties(value: string): StringProperties {
    // 1. Length - simple character count
    const length = value.length;

    // 2. Is palindrome - case-insensitive check
    const normalizedValue = value.toLowerCase().replace(/\s/g, '');
    const reversedValue = normalizedValue.split('').reverse().join('');
    const is_palindrome = normalizedValue === reversedValue;

    // 3. Unique characters - using Set for distinct count
    const unique_characters = new Set(value).size;

    // 4. Word count - split by whitespace and filter empty strings
    const words = value
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0);
    const word_count = words.length;

    // 5. SHA-256 hash for unique identification
    const sha256_hash = createHash('sha256').update(value).digest('hex');

    // 6. Character frequency map
    const character_frequency_map: Record<string, number> = {};
    for (const char of value) {
      character_frequency_map[char] = (character_frequency_map[char] || 0) + 1;
    }

    return {
      length,
      is_palindrome,
      unique_characters,
      word_count,
      sha256_hash,
      character_frequency_map,
    };
  }

  /**
   * Create and analyze a new string
   */
  async create(createStringDto: CreateStringDto): Promise<AnalyzedString> {
    const { value } = createStringDto;

    // Check if string already exists
    const existing = await this.stringRepository.findOne({ where: { value } });
    if (existing) {
      throw new ConflictException('String already exists in the system');
    }

    // Compute all properties
    const properties = this.computeProperties(value);

    // Create new entity
    const analyzedString = this.stringRepository.create({
      id: properties.sha256_hash,
      value,
      properties,
    });

    // Save to database
    return await this.stringRepository.save(analyzedString);
  }

  /**
   * Find a specific string by its value
   */
  async findByValue(value: string): Promise<AnalyzedString> {
    const analyzedString = await this.stringRepository.findOne({
      where: { value },
    });

    if (!analyzedString) {
      throw new NotFoundException('String does not exist in the system');
    }

    return analyzedString;
  }

  /**
   * Find all strings with optional filtering
   */
  async findAll(filters: FilterStringsDto): Promise<{
    data: AnalyzedString[];
    count: number;
    filters_applied: FilterStringsDto;
  }> {
    let query = this.stringRepository.createQueryBuilder('string');

    // Apply is_palindrome filter
    if (filters.is_palindrome !== undefined) {
      query = query.andWhere(
        "(string.properties->>'is_palindrome')::boolean = :is_palindrome",
        { is_palindrome: filters.is_palindrome },
      );
    }

    // Apply min_length filter
    if (filters.min_length !== undefined) {
      query = query.andWhere(
        "(string.properties->>'length')::int >= :min_length",
        { min_length: filters.min_length },
      );
    }

    // Apply max_length filter
    if (filters.max_length !== undefined) {
      query = query.andWhere(
        "(string.properties->>'length')::int <= :max_length",
        { max_length: filters.max_length },
      );
    }

    // Apply word_count filter
    if (filters.word_count !== undefined) {
      query = query.andWhere(
        "(string.properties->>'word_count')::int = :word_count",
        { word_count: filters.word_count },
      );
    }

    // Apply contains_character filter
    if (filters.contains_character) {
      query = query.andWhere('string.value LIKE :char', {
        char: `%${filters.contains_character}%`,
      });
    }

    // Execute query with ordering
    const data = await query.orderBy('string.created_at', 'DESC').getMany();

    return {
      data,
      count: data.length,
      filters_applied: filters,
    };
  }

  /**
   * Filter strings using natural language query
   */
  async filterByNaturalLanguage(queryText: string): Promise<{
    data: AnalyzedString[];
    count: number;
    interpreted_query: {
      original: string;
      parsed_filters: FilterStringsDto;
    };
  }> {
    // Parse the natural language query into filters
    const filters = this.parseNaturalLanguageQuery(queryText);

    // Check if parsing was successful
    if (Object.keys(filters).length === 0) {
      throw new BadRequestException('Unable to parse natural language query');
    }

    // Apply the parsed filters
    const result = await this.findAll(filters);

    return {
      data: result.data,
      count: result.count,
      interpreted_query: {
        original: queryText,
        parsed_filters: filters,
      },
    };
  }

  /**
   * Parse natural language query into structured filters
   */
  private parseNaturalLanguageQuery(query: string): FilterStringsDto {
    const filters: FilterStringsDto = {};
    const lowerQuery = query.toLowerCase();

    // Detect palindrome queries
    if (
      lowerQuery.includes('palindrom') ||
      lowerQuery.includes('reads same forwards and backwards')
    ) {
      filters.is_palindrome = true;
    }

    // Detect word count
    if (lowerQuery.includes('single word') || lowerQuery.includes('one word')) {
      filters.word_count = 1;
    } else if (
      lowerQuery.includes('two word') ||
      lowerQuery.includes('2 word')
    ) {
      filters.word_count = 2;
    } else if (
      lowerQuery.includes('three word') ||
      lowerQuery.includes('3 word')
    ) {
      filters.word_count = 3;
    }

    // Detect length constraints - "longer than X"
    const longerThanMatch = lowerQuery.match(/longer than (\d+)/);
    if (longerThanMatch) {
      filters.min_length = parseInt(longerThanMatch[1], 10) + 1;
    }

    // Detect length constraints - "shorter than X"
    const shorterThanMatch = lowerQuery.match(/shorter than (\d+)/);
    if (shorterThanMatch) {
      filters.max_length = parseInt(shorterThanMatch[1], 10) - 1;
    }

    // Detect exact length - "length of X" or "X characters long"
    const exactLengthMatch = lowerQuery.match(/length (?:of )?(\d+)/);
    if (exactLengthMatch) {
      const len = parseInt(exactLengthMatch[1], 10);
      filters.min_length = len;
      filters.max_length = len;
    }

    // Detect character containment - "containing letter X" or "contain X"
    const containsLetterMatch = lowerQuery.match(
      /contain(?:ing|s)? (?:the )?(?:letter |character )?([a-z])/,
    );
    if (containsLetterMatch) {
      filters.contains_character = containsLetterMatch[1];
    }

    // Special case: "first vowel" means 'a'
    if (lowerQuery.includes('first vowel')) {
      filters.contains_character = 'a';
    }

    // Special case: detect specific vowels mentioned
    if (lowerQuery.includes('vowel')) {
      const vowels = ['a', 'e', 'i', 'o', 'u'];
      for (const vowel of vowels) {
        if (lowerQuery.includes(vowel)) {
          filters.contains_character = vowel;
          break;
        }
      }
    }

    return filters;
  }

  /**
   * Delete a string by its value
   */
  async delete(value: string): Promise<void> {
    const result = await this.stringRepository.delete({ value });

    if (result.affected === 0) {
      throw new NotFoundException('String does not exist in the system');
    }
  }
}
