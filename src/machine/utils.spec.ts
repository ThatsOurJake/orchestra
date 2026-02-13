import { describe, expect, it } from 'vitest';
import { replaceContextInStr } from './utils';

describe('replaceContextInStr', () => {
  const context = new Map<string, unknown>();
  context.set('test', 'hello there');
  context.set('test2', true);
  context.set('test3', ['wrong', 'correct']);

  it('returns the input when replacement key is not found', () => {
    const str = 'hello';

    const res = replaceContextInStr(str, context);

    expect(res).toBe('hello');
  });

  it('wont replace a variable if the key is not present in context', () => {
    const str = '%boo%';

    const res = replaceContextInStr(str, context);

    expect(res).toBe('%boo%');
  });

  it('replaces the key with the value in context', () => {
    const str = '%test%';

    const res = replaceContextInStr(str, context);

    expect(res).toBe('hello there');
  });

  it('will convert any non string type to a string', () => {
    const str = '%test2%';

    const res = replaceContextInStr(str, context);

    expect(res).toBe('true');
  });

  it('will handle lang expressions and normal replacements', () => {
    const str = `1st index Array: #ARR(%test3%, 1)# | Is true: #EQ(%test2%, true)# | Normal Replacement: %test%`;

    const res = replaceContextInStr(str, context);

    expect(res).toBe(
      '1st index Array: correct | Is true: true | Normal Replacement: hello there',
    );
  });
});
