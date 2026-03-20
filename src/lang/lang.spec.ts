import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
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

  it('correctly handles TRIM', () => {
    const statement = 'TRIM("Hello there    ")';

    const result = langRunner(statement, new Map());

    expect(result).toBe('Hello there');
  });

  it('correctly handles REPL with no flags and replaces first instance', () => {
    const statement = 'REPL("12121212", "1", "3")';

    const result = langRunner(statement, new Map());

    expect(result).toBe('32121212');
  });

  it('correctly handles REPL with global flag and replaces all instances', () => {
    const statement = 'REPL("12121212", "1", "3", "g")';

    const result = langRunner(statement, new Map());

    expect(result).toBe('32323232');
  });

  it('correctly handles REPL with ignore flag and replaces all instances despite the case', () => {
    const statement = 'REPL("HehEhEhe", "H", "O", "gi")';

    const result = langRunner(statement, new Map());

    expect(result).toBe('OeOEOEOe');
  });
});

describe('Syntax Check', () => {
  it('should returns errors for invalid syntax', () => {
    const statement = 'EQ()';

    const result = syntaxCheck(statement);

    expect(result).toHaveLength(1);
    expect(result[0].message).toContain(
      `Expecting: one of these possible Token sequences`,
    );
  });
});

describe('TODAY', () => {
  const FIXED_DATE = new Date(2026, 2, 20); // 20 March 2026

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_DATE);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns todays date in ISO format (yyyy-mm-dd) when no format is provided', () => {
    const result = langRunner('TODAY()', new Map());

    expect(result).toBe('2026-03-20');
  });

  it('formats date as dd/mm/yyyy', () => {
    const result = langRunner('TODAY("dd/mm/yyyy")', new Map());

    expect(result).toBe('20/03/2026');
  });

  it('formats date as dd-mm-yyyy', () => {
    const result = langRunner('TODAY("dd-mm-yyyy")', new Map());

    expect(result).toBe('20-03-2026');
  });

  it('formats date as yyyy/mm/dd', () => {
    const result = langRunner('TODAY("yyyy/mm/dd")', new Map());

    expect(result).toBe('2026/03/20');
  });

  it('formats date as mm-dd-yyyy', () => {
    const result = langRunner('TODAY("mm-dd-yyyy")', new Map());

    expect(result).toBe('03-20-2026');
  });

  it('formats date with short year yy', () => {
    const result = langRunner('TODAY("dd/mm/yy")', new Map());

    expect(result).toBe('20/03/26');
  });

  it('formats date with no-padding day and month tokens', () => {
    const result = langRunner('TODAY("d/m/yyyy")', new Map());

    expect(result).toBe('20/3/2026');
  });

  it('can be used inside other expressions like NOT(NULL(TODAY()))', () => {
    const result = langRunner('NOT(NULL(TODAY()))', new Map());

    expect(result).toBe(true);
  });
});
