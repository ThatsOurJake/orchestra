import type { CstNode, IToken } from 'chevrotain';
import { PREV_OUTPUT_KEY } from '../machine';
import { SyntaxParser } from './parser';

interface OneArgListCstNode extends CstNode {
  name: 'oneArgList';
  children: {
    expression: ExpressionCstNode[];
  };
}

interface ZeroOrOneArgListCstNode extends CstNode {
  name: 'zeroOrOneArgList';
  children: {
    expression?: ExpressionCstNode[];
  };
}

interface TwoArgListCstNode extends CstNode {
  name: 'twoArgList';
  children: {
    expression: ExpressionCstNode[];
    Comma?: IToken[];
  };
}

interface ThreeOrFourArgListCstNode extends CstNode {
  name: 'threeOrFourArgList';
  children: {
    expression: ExpressionCstNode[];
    Comma?: IToken[];
  };
}

interface ValueCstNode extends CstNode {
  name: 'value';
  children: {
    Variable?: IToken[];
    StringLiteral?: IToken[];
    Integer?: IToken[];
    Identifier?: IToken[];
  };
}

interface FunctionalCallCstNode extends CstNode {
  name: 'functionalCall';
  children: {
    ARR?: IToken[];
    NULL?: IToken[];
    NOT?: IToken[];
    EQ?: IToken[];
    TRIM?: IToken[];
    REPL?: IToken[];
    TODAY?: IToken[];
    LeftBracket: IToken[];
    zeroOrOneArgList?: ZeroOrOneArgListCstNode[];
    oneArgList?: OneArgListCstNode[];
    twoArgList?: TwoArgListCstNode[];
    threeOrFourArgList?: ThreeOrFourArgListCstNode[];
    RightBracket: IToken[];
  };
}

interface ExpressionCstNode extends CstNode {
  name: 'expression';
  children: {
    functionalCall?: FunctionalCallCstNode[];
    value?: ValueCstNode[];
  };
}

const parserInstance = new SyntaxParser();
const BaseSyntaxVisitor = parserInstance.getBaseCstVisitorConstructor();

export class SyntaxInterpreter extends BaseSyntaxVisitor {
  private context: Map<string, unknown>;

  constructor(context: Map<string, unknown>) {
    super();
    this.context = context;
    this.validateVisitor();
  }

  expression(ctx: ExpressionCstNode['children']) {
    if (ctx.functionalCall) {
      return this.visit(ctx.functionalCall);
    }

    return this.visit(ctx.value!);
  }

  functionalCall(ctx: FunctionalCallCstNode['children']) {
    let funcName = '';

    if (ctx.ARR) {
      funcName = 'ARR';
    } else if (ctx.NULL) {
      funcName = 'NULL';
    } else if (ctx.NOT) {
      funcName = 'NOT';
    } else if (ctx.EQ) {
      funcName = 'EQ';
    } else if (ctx.TRIM) {
      funcName = 'TRIM';
    } else if (ctx.REPL) {
      funcName = 'REPL';
    } else if (ctx.TODAY) {
      funcName = 'TODAY';
    }

    let args: unknown[];
    if (ctx.zeroOrOneArgList) {
      args = this.visit(ctx.zeroOrOneArgList);
    } else if (ctx.oneArgList) {
      args = this.visit(ctx.oneArgList);
    } else if (ctx.threeOrFourArgList) {
      args = this.visit(ctx.threeOrFourArgList);
    } else {
      args = this.visit(ctx.twoArgList!);
    }

    return this.executeFunction(funcName, args);
  }

  zeroOrOneArgList(ctx: ZeroOrOneArgListCstNode['children']) {
    if (!ctx.expression || ctx.expression.length === 0) {
      return [];
    }
    return ctx.expression.map((expr) => this.visit(expr));
  }

  oneArgList(ctx: OneArgListCstNode['children']) {
    return ctx.expression.map((expr) => this.visit(expr));
  }

  twoArgList(ctx: TwoArgListCstNode['children']) {
    return ctx.expression.map((expr) => this.visit(expr));
  }

  threeOrFourArgList(ctx: ThreeOrFourArgListCstNode['children']) {
    return ctx.expression.map((expr) => this.visit(expr));
  }

  // biome-ignore lint/suspicious/noExplicitAny: Args can be anything in this case
  executeFunction(name: string, args: any[]) {
    switch (name) {
      case 'ARR': {
        if (!Array.isArray(args[0])) {
          return null;
        }

        let index: string | number = args[1];

        if (typeof index === 'string') {
          index = parseInt(index, 10);
        }

        return args[0][index];
      }
      case 'NULL': {
        const arg = args[0];

        if (arg === null || arg === undefined) {
          return true;
        }

        if (typeof arg === 'string') {
          return arg.trim().length === 0;
        }

        return false;
      }
      case 'NOT':
        return !args[0];
      case 'EQ': {
        if (typeof args[0] === 'boolean' && typeof args[1] === 'string') {
          return `${args[0]}` === args[1];
        }

        if (typeof args[0] === 'string' && typeof args[1] === 'boolean') {
          return args[0] === `${args[1]}`;
        }

        return args[0] === args[1];
      }
      case 'TRIM': {
        return `${args[0]}`.trim();
      }
      case 'REPL': {
        const input = args[0] as string;
        const find = args[1] as string;
        const replaceWith = args[2] as string;
        const flags = args[3] as string | undefined;
        const regex = new RegExp(
          find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
          flags || '',
        );
        return input.replace(regex, replaceWith);
      }
      case 'TODAY': {
        const now = new Date();
        const format = args[0] as string | undefined;

        if (!format) {
          return now.toISOString().split('T')[0];
        }

        const day = now.getDate();
        const month = now.getMonth() + 1;
        const fullYear = now.getFullYear();
        const shortYear = String(fullYear).slice(-2);

        return format
          .replace('dd', String(day).padStart(2, '0'))
          .replace('mm', String(month).padStart(2, '0'))
          .replace('yyyy', String(fullYear))
          .replace('yy', shortYear)
          .replace('d', String(day))
          .replace('m', String(month));
      }
    }
  }

  value(ctx: ValueCstNode['children']) {
    if (ctx.Variable) {
      const variableName = ctx.Variable[0].image.slice(1, -1);
      const ctxKey =
        variableName === PREV_OUTPUT_KEY ? PREV_OUTPUT_KEY : variableName;
      const variableValue = this.context.get(ctxKey);

      return variableValue;
    }

    if (ctx.StringLiteral) {
      return ctx.StringLiteral[0].image.slice(1, -1);
    }

    if (ctx.Integer) {
      return parseInt(ctx.Integer[0].image, 10);
    }

    return ctx.Identifier![0].image;
  }
}
