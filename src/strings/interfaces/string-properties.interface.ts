/**
 * Interface representing the computed properties of an analyzed string
 */
export interface StringProperties {
  /**
   * Number of characters in the string
   */
  length: number;

  /**
   * Boolean indicating if the string reads the same forwards and backwards (case-insensitive)
   */
  is_palindrome: boolean;

  /**
   * Count of distinct characters in the string
   */
  unique_characters: number;

  /**
   * Number of words separated by whitespace
   */
  word_count: number;

  /**
   * SHA-256 hash of the string for unique identification
   */
  sha256_hash: string;

  /**
   * Object/dictionary mapping each character to its occurrence count
   */
  character_frequency_map: Record<string, number>;
}
