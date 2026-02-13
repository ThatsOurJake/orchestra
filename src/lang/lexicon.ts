import { createToken, Lexer } from 'chevrotain';

export const Identifier = createToken({
  name: 'Identifier',
  pattern: /[a-zA-z]\w+/,
});

export const ARR = createToken({
  name: 'ARR',
  pattern: /ARR/,
  longer_alt: Identifier,
});

export const NULL = createToken({
  name: 'NULL',
  pattern: /NULL/,
  longer_alt: Identifier,
});

export const NOT = createToken({
  name: 'NOT',
  pattern: /NOT/,
  longer_alt: Identifier,
});

export const EQ = createToken({
  name: 'EQ',
  pattern: /EQ/,
  longer_alt: Identifier,
});

export const TRIM = createToken({
  name: 'TRIM',
  pattern: /TRIM/,
  longer_alt: Identifier,
});

export const WhiteSpace = createToken({
  name: 'WhiteSpace',
  pattern: /\s+/,
  group: Lexer.SKIPPED,
});

export const Variable = createToken({
  name: 'Variable',
  pattern: /%[a-zA-Z_]\w*%/,
});

export const StringLiteral = createToken({
  name: 'StringLiteral',
  pattern: /"[^"]*"/,
});

export const Comma = createToken({
  name: 'Comma',
  pattern: /,/,
});

export const Integer = createToken({
  name: 'Integer',
  pattern: /0|[1-9]\d*/,
});

export const LeftBracket = createToken({
  name: 'LeftBracket',
  pattern: /\(/,
});

export const RightBracket = createToken({
  name: 'RightBracket',
  pattern: /\)/,
});

export const allLangTokens = [
  WhiteSpace,
  // Keywords
  ARR,
  EQ,
  NULL,
  NOT,
  TRIM,
  Variable,
  // Other
  Identifier,
  Comma,
  Integer,
  LeftBracket,
  RightBracket,
  StringLiteral,
];

export const Lexicon = new Lexer(allLangTokens);
