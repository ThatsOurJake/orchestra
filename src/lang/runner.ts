import { Lexer } from 'chevrotain';
import { SyntaxInterpreter } from './interpreter';
import { allLangTokens } from './lexicon';
import { SyntaxParser } from './parser';

const Lexicon = new Lexer(allLangTokens);

export const langRunner = (
  statement: string,
  context: Map<string, unknown>,
) => {
  const lexResult = Lexicon.tokenize(statement);

  const parser = new SyntaxParser();
  parser.input = lexResult.tokens;
  const cst = parser.expression();

  if (parser.errors.length > 0) {
    throw new Error(`Parse errors: ${parser.errors}`);
  }

  const interpreter = new SyntaxInterpreter(context);

  return interpreter.visit(cst);
};

export const syntaxCheck = (statement: string) => {
  const lexResult = Lexicon.tokenize(statement);

  const parser = new SyntaxParser();
  parser.input = lexResult.tokens;
  parser.expression();

  return parser.errors;
};
