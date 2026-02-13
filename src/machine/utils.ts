import { langRunner } from '../lang/runner';

const replacementRegex = /%[^%]+%/g;
const executeLangRegex = /#[^#]+#/g;

export const replaceContextInStr = (
  str: string,
  context: Map<string, unknown>,
) => {
  let output = `${str}`;

  const langMatches = output.match(executeLangRegex) || [];

  for (const langMatch of langMatches) {
    const statement = langMatch.substring(1, langMatch.length - 1);
    const result = langRunner(statement, context);
    output = output.replace(langMatch, result);
  }

  const replacementMatches = output.match(replacementRegex) || [];

  for (const replaceMatch of replacementMatches) {
    const key = replaceMatch.replaceAll('%', '');
    const value = context.get(key);

    if (!value) {
      continue;
    }

    output = output.replaceAll(replaceMatch, `${value}`);
  }

  return output;
};

export const findValueFromNodeInContext = (
  from: string | 'prev_output',
  context: Map<string, unknown>,
) => {
  if (!context.has(from)) {
    return null;
  }

  return context.get(from);
};
