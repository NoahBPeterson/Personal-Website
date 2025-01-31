import { Token, TokenType } from './Token';

export class Scanner {
  private source: string;
  private tokens: Token[] = [];
  private start = 0;
  private current = 0;
  private line = 1;

  constructor(source: string) {
    this.source = source;
  }

  scanTokens(): Token[] {
    while (!this.isAtEnd()) {
      this.start = this.current;
      this.scanToken();
    }

    return this.tokens;
  }

  private scanToken() {
    const c = this.advance();
    switch (c) {
      // Single character tokens
      case '(': this.addToken(TokenType.LEFT_PAREN); break;
      case ')': this.addToken(TokenType.RIGHT_PAREN); break;
      case '{': this.addToken(TokenType.LEFT_BRACE); break;
      case '}': this.addToken(TokenType.RIGHT_BRACE); break;
      case ',': this.addToken(TokenType.COMMA); break;
      case '.': this.addToken(TokenType.DOT); break;
      case '-': this.addToken(TokenType.MINUS); break;
      case '+': this.addToken(TokenType.PLUS); break;
      case ';': this.addToken(TokenType.SEMICOLON); break;
      case '*': this.addToken(TokenType.ASTERISK); break;
      case ':': this.addToken(TokenType.TERNARY_COLON); break;

      // Two character tokens
      case '\'':
        const nextChar = this.peek();
        if ((nextChar === 's' || nextChar === 'S') && this.isWhitespace(this.peekNext())) {
          this.advance(); // consume 's'
          this.addToken(TokenType.APOSTROPHE);
        } else if ((this.peekPrevious(2) === 's' || this.peekPrevious(2) === 'S') && this.isWhitespace(this.peek())) {
          this.addToken(TokenType.APOSTROPHE);
        } else {
          this.addToken(TokenType.DEFAULT, c);
          // In a real implementation, we'd want to add error handling here
          // console.error(`Line ${this.line}: Expected 's' before or after ' and whitespace after '`);
        }
        break;

      case 's':
      case 'S':
        if (this.match('\'') && this.isWhitespace(this.peek())) {
          this.addToken(TokenType.APOSTROPHE);
        } else {
          this.identifier(); // Handle as normal identifier
        }
        break;
      case '?': 
        if (this.match('?')) {
          this.addToken(TokenType.QUESTION_QUESTION);
        } else if (this.match('.')) {
          this.addToken(TokenType.QUESTION_DOT);
        } else {
          this.addToken(TokenType.TERNARY_QUESTION);
        }
        break;
      case '!': this.addToken(this.match('=') ? TokenType.EXCLAMATION_EQUALS : TokenType.EXCLAMATION); break;
      case '=': this.addToken(this.match('=') ? TokenType.EQUALS_EQUALS : TokenType.EQUALS); break;
      case '<': this.addToken(this.match('=') ? TokenType.LESS_THAN_EQUALS : TokenType.LESS_THAN); break;
      case '>': this.addToken(this.match('=') ? TokenType.GREATER_THAN_EQUALS : TokenType.GREATER_THAN); break;

      // Handle whitespace
      case ' ':
      case '\r':
      case '\t':
        this.addToken(TokenType.WHITESPACE, c);
        break;
      case '\n':
        this.line++;
        this.addToken(TokenType.WHITESPACE, c);
        break;

      // String literals
      case '"': 
        this.string(); 
        break;

      case '/':
        if (this.match('/')) {
          // Single-line comment goes until the end of the line
          let comment = '//';
          while (this.peek() !== '\n' && !this.isAtEnd()) {
            comment += this.advance();
          }
          this.addToken(TokenType.COMMENT, comment);
        } else if (this.match('*')) {
          // Multi-line comment goes until */
          let comment = '/*';
          while (!this.isAtEnd()) {
            if (this.peek() === '*' && this.peekNext() === '/') {
              comment += '*/';
              this.advance(); // consume *
              this.advance(); // consume /
              break;
            }
            if (this.peek() === '\n') {
              this.line++;
            }
            comment += this.advance();
          }
          this.addToken(TokenType.COMMENT, comment);
        } else {
          this.addToken(TokenType.FORWARD_SLASH, c);
        }
        break;

      default:
        if (this.isDigit(c)) {
          this.number();
        } else if (this.isAlpha(c)) {
          this.identifier();
        } else {
          // Add unknown characters as default tokens
          this.addToken(TokenType.DEFAULT, c);
        }
    }
  }

  private string() {
    let terminated = false;
    while (!this.isAtEnd()) {
      if (this.peek() === '"') {
        terminated = true;
        break;
      }
      if (this.peek() === '\n') this.line++;
      this.advance();
    }

    if (terminated) {
      // Include both quotes for terminated strings
      this.advance(); // consume the closing quote
      const value = this.source.substring(this.start, this.current);
      this.addToken(TokenType.STRING, value);
    } else {
      // Include opening quote for unterminated strings
      const value = this.source.substring(this.start, this.current);
      this.addToken(TokenType.STRING_UNTERMINATED, value);
    }
  }

  private number() {
    while (this.isDigit(this.peek())) this.advance();

    // Look for a decimal part.
    if (this.peek() === '.' && this.isDigit(this.peekNext())) {
      // Consume the "."
      this.advance();

      while (this.isDigit(this.peek())) this.advance();
    }

    this.addToken(TokenType.NUMBER,
      this.source.substring(this.start, this.current));
  }

  private identifier() {
    while (this.isAlphaNumeric(this.peek())) this.advance();

    const text = this.source.substring(this.start, this.current);
    const type = KEYWORDS[text] || TokenType.IDENTIFIER;
    this.addToken(type);
  }

  private match(expected: string): boolean {
    if (this.isAtEnd()) return false;
    if (this.source.charAt(this.current) !== expected) return false;

    this.current++;
    return true;
  }

  private peek(): string {
    if (this.isAtEnd()) return '\0';
    return this.source.charAt(this.current);
  }

  private peekNext(): string {
    if (this.current + 1 >= this.source.length) return '\0';
    return this.source.charAt(this.current + 1);
  }

  private peekPrevious(offset: number = 1): string {
    if (this.current - offset < 0) return '\0';
    return this.source.charAt(this.current - offset);
  }

  private isWhitespace(c: string): boolean {
    return c === ' ' || c === '\t' || c === '\r' || c === '\n';
  }

  private isAlpha(c: string): boolean {
    return (c >= 'a' && c <= 'z') ||
           (c >= 'A' && c <= 'Z') ||
            c === '_';
  }

  private isAlphaNumeric(c: string): boolean {
    return this.isAlpha(c) || this.isDigit(c);
  }

  private isDigit(c: string): boolean {
    return c >= '0' && c <= '9';
  }

  private isAtEnd(): boolean {
    return this.current >= this.source.length;
  }

  private advance(): string {
    return this.source.charAt(this.current++);
  }

  private addToken(type: TokenType, literal: any = null) {
    const text = this.source.substring(this.start, this.current);
    this.tokens.push({ 
      type, 
      lexeme: literal?.toString() || text, 
      literal: literal || text,
      line: this.line, 
      characters: text.length 
    });
  }
}

const KEYWORDS: { [key: string]: TokenType } = {
  'and':    TokenType.AND,
  'class':  TokenType.CLASS,
  'else':   TokenType.ELSE,
  'false':  TokenType.FALSE,
  'for':    TokenType.FOR,
  'fun':    TokenType.FUNC,
  'if':     TokenType.IF,
  'nil':    TokenType.NIL,
  'or':     TokenType.OR,
  'print':  TokenType.PRINT,
  'return': TokenType.RETURN,
  'super':  TokenType.SUPER_CLASS,
  'this':   TokenType.THIS_OBJECT,
  'true':   TokenType.TRUE,
  'var':    TokenType.VAR,
  'while':  TokenType.WHILE,
  'break':  TokenType.BREAK,
  'continue': TokenType.CONTINUE,
  'do':     TokenType.DO
}; 