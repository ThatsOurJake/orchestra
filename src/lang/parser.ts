import { CstParser } from 'chevrotain';
import {
  ARR,
  allLangTokens,
  Comma,
  EQ,
  Identifier,
  Integer,
  LeftBracket,
  NOT,
  NULL,
  RightBracket,
  StringLiteral,
  TRIM,
  Variable,
} from './lexicon';

export class SyntaxParser extends CstParser {
  constructor() {
    super(allLangTokens);
    this.performSelfAnalysis();
  }

  expression = this.RULE('expression', () => {
    this.OR([
      { ALT: () => this.SUBRULE(this.functionalCall) },
      { ALT: () => this.SUBRULE(this.value) },
    ]);
  });

  functionalCall = this.RULE('functionalCall', () => {
    this.OR([
      {
        ALT: () => {
          this.OR2([
            { ALT: () => this.CONSUME(ARR) },
            { ALT: () => this.CONSUME2(EQ) },
          ]);
          this.CONSUME(LeftBracket);
          this.SUBRULE(this.twoArgList);
          this.CONSUME(RightBracket);
        },
      },
      {
        ALT: () => {
          this.OR3([
            { ALT: () => this.CONSUME3(NULL) },
            { ALT: () => this.CONSUME4(NOT) },
            { ALT: () => this.CONSUME5(TRIM) },
          ]);
          this.CONSUME2(LeftBracket);
          this.SUBRULE2(this.oneArgList);
          this.CONSUME2(RightBracket);
        },
      },
    ]);
  });

  oneArgList = this.RULE('oneArgList', () => {
    this.SUBRULE(this.expression);
  });

  twoArgList = this.RULE('twoArgList', () => {
    this.SUBRULE(this.expression);
    this.CONSUME(Comma);
    this.SUBRULE2(this.expression);
  });

  value = this.RULE('value', () => {
    this.OR([
      { ALT: () => this.CONSUME(Variable) },
      { ALT: () => this.CONSUME(StringLiteral) },
      { ALT: () => this.CONSUME(Integer) },
      { ALT: () => this.CONSUME(Identifier) },
    ]);
  });
}
