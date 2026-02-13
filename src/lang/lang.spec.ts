import { describe, expect, it } from 'vitest';
import { langRunner, syntaxCheck } from './runner';

describe('Lang Runner', () => {
  it('handles "EQ("jake", "bake")" returning false', () => {
    const context = new Map();

    const result = langRunner('EQ("jake", "bake")', context);

    expect(result).toEqual(false);
  });

  it('handles "EQ("bake", "bake")" returning true', () => {
    const context = new Map();

    const result = langRunner('EQ("bake", "bake")', context);

    expect(result).toEqual(true);
  });

  it('handles "NOT" and negates the input', () => {
    const context = new Map();

    const result = langRunner('NOT(EQ("bake", "bake"))', context);

    expect(result).toBe(false);
  });

  it('handles "NULL(%foo%)", context does not contain the variable by returning true', () => {
    const context = new Map();

    const result = langRunner('NULL(%foo%)', context);

    expect(result).toBe(true);
  });

  it('handles "NULL(%foo%)", context does contain the variable by returning false', () => {
    const context = new Map();
    context.set('foo', 'hello there');

    const result = langRunner('NULL(%foo%)', context);

    expect(result).toBe(false);
  });

  it('handles "NULL(%foo%)", context does contain the variable but empty string by returning true', () => {
    const context = new Map();
    context.set('foo', '  ');

    const result = langRunner('NULL(%foo%)', context);

    expect(result).toBe(true);
  });

  it('handles "ARR(%foo%, 0)" by returning the correct value', () => {
    const arr = ['correct', 'wrong'];
    const context = new Map();
    context.set('foo', arr);

    const result = langRunner('ARR(%foo%, 0)', context);

    expect(result).toBe('correct');
  });

  it('handles "ARR(%foo%, 0)", context does not contain variable and returns null', () => {
    const context = new Map();

    const result = langRunner('ARR(%foo%, 0)', context);

    expect(result).toBe(null);
  });

  it('handles chaining of expressions', () => {
    const statement = 'NOT(EQ(%foo%, NULL(%bar%)))';
    const context = new Map();
    context.set('foo', true);

    const result = langRunner(statement, context);

    expect(result).toBe(false);
  });

  it('returns just the plain variable if present in context', () => {
    const statement = '%foo%';
    const context = new Map();
    context.set('foo', 'hello');

    const result = langRunner(statement, context);

    expect(result).toBe('hello');
  });

  it('returns undefined if not present in context', () => {
    const statement = '%boo%';
    const context = new Map();
    context.set('foo', 'hello');

    const result = langRunner(statement, context);

    expect(result).toBeUndefined();
  });
});

describe('Syntax Check', () => {
  it('should returns errors for invalid syntax', () => {
    const statement = 'EQ()';

    const result = syntaxCheck(statement);

    expect(result).toHaveLength(1);
    expect(
      result[0].message,
    ).toBe(`Expecting: one of these possible Token sequences:
  1. [ARR]
  2. [EQ]
  3. [NULL]
  4. [NOT]
  5. [Variable]
  6. [StringLiteral]
  7. [Integer]
  8. [Identifier]
but found: ')'`);
  });
});
