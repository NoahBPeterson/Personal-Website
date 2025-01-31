export enum TokenType {
  // 1 char tokens
  LEFT_PAREN = 'LEFT_PAREN',
  RIGHT_PAREN = 'RIGHT_PAREN',
  LEFT_BRACE = 'LEFT_BRACE',
  RIGHT_BRACE = 'RIGHT_BRACE',
  COMMA = 'COMMA',
  DOT = 'DOT',
  MINUS = 'MINUS',
  PLUS = 'PLUS',
  FORWARD_SLASH = 'FORWARD_SLASH',
  ASTERISK = 'ASTERISK',
  SEMICOLON = 'SEMICOLON',

  // 1-2 char tokens
  EXCLAMATION = 'EXCLAMATION',
  EXCLAMATION_EQUALS = 'EXCLAMATION_EQUALS',
  EQUALS = 'EQUALS',
  EQUALS_EQUALS = 'EQUALS_EQUALS',
  GREATER_THAN = 'GREATER_THAN',
  GREATER_THAN_EQUALS = 'GREATER_THAN_EQUALS',
  LESS_THAN = 'LESS_THAN',
  LESS_THAN_EQUALS = 'LESS_THAN_EQUALS',
  TERNARY_QUESTION = 'TERNARY_QUESTION',
  TERNARY_COLON = 'TERNARY_COLON',
  PLUS_PLUS = 'PLUS_PLUS',
  MINUS_MINUS = 'MINUS_MINUS',
  QUESTION_QUESTION = 'QUESTION_QUESTION',
  QUESTION_DOT = 'QUESTION_DOT',
  DOT_DOT = 'DOT_DOT',

  // 3 char token
  APOSTROPHE = 'APOSTROPHE',

  // Literals
  IDENTIFIER = 'IDENTIFIER',
  STRING = 'STRING',
  STRING_UNTERMINATED = 'STRING_UNTERMINATED',
  NUMBER = 'NUMBER',

  // Keywords
  AND = 'AND',
  OR = 'OR',
  CLASS = 'CLASS',
  IF = 'IF',
  ELSE = 'ELSE',
  FUNC = 'FUNC',
  FOR = 'FOR',
  NIL = 'NIL',
  FALSE = 'FALSE',
  PRINT = 'PRINT',
  RETURN = 'RETURN',
  SUPER_CLASS = 'SUPER_CLASS',
  THIS_OBJECT = 'THIS_OBJECT',
  TRUE = 'TRUE',
  VAR = 'VAR',
  WHILE = 'WHILE',
  BREAK = 'BREAK',
  CONTINUE = 'CONTINUE',
  DO = 'DO',

  EOF = 'EOF',
  WHITESPACE = 'WHITESPACE',
  DEFAULT = 'DEFAULT',
  COMMENT = 'COMMENT'
}

export interface Token {
  type: TokenType;
  lexeme: string;
  literal: any;
  line: number;
  characters: number;
  context?: 'expression-start' | 'expression-end' | 'operator' | 
            'variable-declaration' | 'variable-reference' | 'keyword' |
            'function-declaration' | 'function-call';
}

export class TokenClass implements Token {
  type: TokenType;
  lexeme: string;
  literal: any;
  line: number;
  characters: number;
  context?: 'expression-start' | 'expression-end' | 'operator';

  constructor(type: TokenType, lexeme: string, literal: any, line: number, characters: number) {
    this.type = type;
    this.lexeme = lexeme;
    this.literal = literal;
    this.line = line;
    this.characters = characters;
  }

  toString(): string {
    return `${this.type} ${this.lexeme} ${this.literal}`;
  }

  static tokenize(input: string): Token[] {
    const scanner = new Scanner(input);
    return scanner.scanTokens();
  }
}

// Re-export the Scanner class to maintain the same functionality
import { Scanner } from './Scanner'; 