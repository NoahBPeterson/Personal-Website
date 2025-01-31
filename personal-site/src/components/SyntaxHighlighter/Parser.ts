import { Token, TokenType } from './Token';

class ParseError extends Error {
  constructor() {
    super();
    this.name = 'ParseError';
  }
}

export class Parser {
  private tokens: Token[];
  private current = 0;
  private inVariableDeclaration = false;
  private inFunctionDeclaration = false;

  constructor(tokens: Token[]) {
    this.tokens = this.preprocessComments(tokens);
  }

  // New method to preprocess and combine comment tokens
  private preprocessComments(tokens: Token[]): Token[] {
    const processed: Token[] = [];
    let i = 0;
    
    while (i < tokens.length) {
      const token = tokens[i];
      
      // If we find a comment token, combine it with all following tokens until newline
      if (token.type === TokenType.COMMENT) {
        let combinedLexeme = token.lexeme;
        let j = i + 1;
        
        // Keep adding tokens until we hit a newline or EOF
        while (j < tokens.length) {
          const nextToken = tokens[j];
          if (nextToken.lexeme.includes('\n')) {
            // Include the newline in the comment
            combinedLexeme += nextToken.lexeme;
            j++;
            break;
          }
          combinedLexeme += nextToken.lexeme;
          j++;
        }
        
        // Create a new combined comment token
        processed.push({
          ...token,
          lexeme: combinedLexeme
        });
        
        i = j; // Skip the tokens we combined
      } else {
        processed.push(token);
        i++;
      }
    }
    
    return processed;
  }

  parse(): Token[] {
    if (!this.tokens || this.tokens.length === 0) {
      return [];
    }

    const parsedTokens: Token[] = [];
    while (!this.isAtEnd()) {
      try {
        const token = this.advance();

        // Check for function declarations
        if (token.type === TokenType.FUNC) {
          this.inFunctionDeclaration = true;
          parsedTokens.push({ ...token, context: 'keyword' });
          continue;
        }

        // Mark identifiers after 'func' as function declarations
        if (this.inFunctionDeclaration && token.type === TokenType.IDENTIFIER) {
          parsedTokens.push({ ...token, context: 'function-declaration' });
          this.inFunctionDeclaration = false;
          continue;
        }

        // Check for variable declarations
        if (token.type === TokenType.VAR) {
          this.inVariableDeclaration = true;
          parsedTokens.push({ ...token, context: 'keyword' });
          continue;
        }

        // Mark identifiers after 'var' as variable declarations
        if (this.inVariableDeclaration && token.type === TokenType.IDENTIFIER) {
          parsedTokens.push({ ...token, context: 'variable-declaration' });
          this.inVariableDeclaration = false;
          continue;
        }

        // Reset declaration states at statement end
        if (token.type === TokenType.SEMICOLON) {
          this.inVariableDeclaration = false;
          this.inFunctionDeclaration = false;
        }

        // Check for function calls (identifier followed by left paren)
        if (token.type === TokenType.IDENTIFIER && this.peek().type === TokenType.LEFT_PAREN) {
          parsedTokens.push({ ...token, context: 'function-call' });
          continue;
        }

        // Add semantic information to the token
        if (this.isStartOfExpression(token)) {
          parsedTokens.push({ ...token, context: 'expression-start' });
        } else if (this.isEndOfExpression(token)) {
          parsedTokens.push({ ...token, context: 'expression-end' });
        } else if (this.isOperator(token)) {
          parsedTokens.push({ ...token, context: 'operator' });
        } else if (token.type === TokenType.IDENTIFIER) {
          parsedTokens.push({ ...token, context: 'variable-reference' });
        } else {
          parsedTokens.push(token);
        }
      } catch (error) {
        this.synchronize();
      }
    }
    return parsedTokens;
  }

  private isStartOfExpression(token: Token): boolean {
    return token.type === TokenType.LEFT_PAREN || 
           token.type === TokenType.LEFT_BRACE || 
           token.type === TokenType.IDENTIFIER ||
           token.type === TokenType.NUMBER ||
           token.type === TokenType.STRING ||
           token.type === TokenType.STRING_UNTERMINATED;
  }

  private isEndOfExpression(token: Token): boolean {
    return token.type === TokenType.RIGHT_PAREN || 
           token.type === TokenType.RIGHT_BRACE || 
           token.type === TokenType.SEMICOLON;
  }

  private isOperator(token: Token): boolean {
    return token.type === TokenType.PLUS ||
           token.type === TokenType.MINUS ||
           token.type === TokenType.ASTERISK ||
           token.type === TokenType.FORWARD_SLASH ||
           token.type === TokenType.EQUALS ||
           token.type === TokenType.EQUALS_EQUALS ||
           token.type === TokenType.EXCLAMATION_EQUALS ||
           token.type === TokenType.GREATER_THAN ||
           token.type === TokenType.GREATER_THAN_EQUALS ||
           token.type === TokenType.LESS_THAN ||
           token.type === TokenType.LESS_THAN_EQUALS;
  }

  private match(...types: TokenType[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  private check(type: TokenType): boolean {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  private isAtEnd(): boolean {
    return this.current >= this.tokens.length || this.peek().type === TokenType.EOF;
  }

  private peek(): Token {
    if (this.current >= this.tokens.length) {
      return {
        type: TokenType.EOF,
        lexeme: '',
        literal: null,
        line: -1,
        characters: 0
      };
    }
    return this.tokens[this.current];
  }

  private previous(): Token {
    if (this.current <= 0) {
      return this.tokens[0];
    }
    return this.tokens[this.current - 1];
  }

  private synchronize(): void {
    this.advance();

    while (!this.isAtEnd()) {
      if (this.previous().type === TokenType.SEMICOLON) return;

      switch (this.peek().type) {
        case TokenType.CLASS:
        case TokenType.FUNC:
        case TokenType.VAR:
        case TokenType.FOR:
        case TokenType.IF:
        case TokenType.WHILE:
        case TokenType.PRINT:
        case TokenType.RETURN:
          return;
      }
      this.advance();
    }
  }
} 