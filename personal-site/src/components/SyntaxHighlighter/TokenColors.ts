export enum TokenColors {
  // Keywords - Purple
  KEYWORD = '#c792ea',
  
  // Literals
  STRING = '#89ca78',  // Green
  STRING_UNTERMINATED = '#e06c75',  // Red
  NUMBER = '#f78c6c',  // Orange
  BOOLEAN = '#ff9cac',  // Pink
  NIL = '#7982a9',  // Gray-Blue
  
  // Identifiers
  IDENTIFIER = '#d4d4d4',  // Light Gray
  FUNCTION = '#61afef',  // Blue
  CLASS = '#e5c07b',  // Yellow-Gold
  
  // Operators and Symbols
  OPERATOR = '#e6b450',  // Gold
  PUNCTUATION = '#89ddff',  // Light Blue
  
  // Comments and Whitespace
  COMMENT = '#676e95',  // Dark Gray
  WHITESPACE = 'transparent',
  
  // Special
  THIS = '#ff9cac',  // Pink
  SUPER = '#ff9cac',  // Pink
  
  // Default
  DEFAULT = '#bbbbbb'  // Light Gray
} 