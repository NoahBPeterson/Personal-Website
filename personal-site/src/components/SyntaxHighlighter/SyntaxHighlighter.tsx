import React, { useRef, useEffect, useState } from 'react';
import { Scanner } from './Scanner';
import { Parser } from './Parser';
import { TokenType } from './Token';
import './SyntaxHighlighter.css';

interface SyntaxHighlighterProps {
  sourceCode: string;
  onChange?: (text: string) => void;
}

const getTokenClass = (type: TokenType): string => {
  // Branching keywords
  if ([
    TokenType.IF, TokenType.ELSE, TokenType.FOR, TokenType.WHILE,
    TokenType.BREAK, TokenType.CONTINUE, TokenType.DO
  ].includes(type)) {
    return 'keyword branch';
  }

  // Other keywords
  if ([
    TokenType.AND, TokenType.CLASS, TokenType.FUNC,
    TokenType.NIL, TokenType.OR, TokenType.PRINT, TokenType.RETURN,
    TokenType.VAR
  ].includes(type)) {
    return 'keyword';
  }

  // Literals
  if (type === TokenType.STRING) return 'string';
  if (type === TokenType.STRING_UNTERMINATED) return 'string-unterminated';
  if (type === TokenType.NUMBER) return 'number';
  if ([TokenType.TRUE, TokenType.FALSE].includes(type)) return 'boolean';
  if (type === TokenType.NIL) return 'nil';

  // Identifiers and special keywords
  if (type === TokenType.IDENTIFIER) return 'identifier';
  if (type === TokenType.FUNC) return 'function';
  if (type === TokenType.CLASS) return 'class';
  if (type === TokenType.THIS_OBJECT) return 'this';
  if (type === TokenType.SUPER_CLASS) return 'super';

  // Operators
  if ([TokenType.PLUS_PLUS, TokenType.MINUS_MINUS].includes(type)) {
    return 'operator increment-decrement';
  }
  if ([TokenType.TERNARY_QUESTION, TokenType.TERNARY_COLON].includes(type)) {
    return 'operator ternary';
  }
  if ([TokenType.QUESTION_QUESTION, TokenType.QUESTION_DOT].includes(type)) {
    return 'operator null-related';
  }
  if ([
    TokenType.PLUS, TokenType.MINUS, TokenType.ASTERISK, TokenType.FORWARD_SLASH,
    TokenType.EQUALS, TokenType.EQUALS_EQUALS, TokenType.EXCLAMATION,
    TokenType.EXCLAMATION_EQUALS, TokenType.GREATER_THAN, TokenType.GREATER_THAN_EQUALS,
    TokenType.LESS_THAN, TokenType.LESS_THAN_EQUALS
  ].includes(type)) {
    return 'operator';
  }

  // Punctuation
  if ([TokenType.LEFT_PAREN, TokenType.RIGHT_PAREN].includes(type)) {
    return 'punctuation paren';
  }
  if ([TokenType.LEFT_BRACE, TokenType.RIGHT_BRACE].includes(type)) {
    return 'punctuation brace';
  }
  if ([TokenType.COMMA, TokenType.DOT, TokenType.SEMICOLON, TokenType.APOSTROPHE].includes(type)) {
    return 'punctuation delimiter';
  }

  // Whitespace and default
  if (type === TokenType.WHITESPACE) return 'whitespace';
  return 'default';
};

const highlightCode = (code: string) => {
  const scanner = new Scanner(code);
  const tokens = scanner.scanTokens();
  const parser = new Parser(tokens);
  const parsedTokens = parser.parse();
  
  const highlighted = parsedTokens.map((token, index) => {
    let className = `code-token ${getTokenClass(token.type)}`;

    // Add semantic context classes
    if (token.context) {
      className += ` ${token.context}`;
    }
    
    return (
      <span key={index} className={className}>
        {token.lexeme}
      </span>
    );
  });

  // Always add an empty line at the end to match textarea behavior
  highlighted.push(<span key="extra-line" className="code-token whitespace">{'\n'}</span>);
  
  return highlighted;
};

const SyntaxHighlighter: React.FC<SyntaxHighlighterProps> = ({ sourceCode, onChange }): JSX.Element => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync scroll positions
  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (overlayRef.current && textareaRef.current) {
      overlayRef.current.scrollTop = textareaRef.current.scrollTop;
      overlayRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  return (
    <div className="syntax-highlighter-container">
      <div className="syntax-overlay" ref={overlayRef}>
        <pre className="code-block">
          <code>{highlightCode(sourceCode)}</code>
        </pre>
      </div>
      <textarea 
        ref={textareaRef}
        className="code-input"
        value={sourceCode}
        onChange={(e) => onChange?.(e.target.value)}
        onScroll={handleScroll}
        maxLength={10000}
        spellCheck={false}
      />
    </div>
  );
};

export default SyntaxHighlighter; 