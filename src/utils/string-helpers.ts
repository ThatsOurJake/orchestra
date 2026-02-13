export const pluralise = (number: number, str: string) => {
  if (number === 1) {
    return str;
  }

  return `${str}s`;
};

export const timeAgo = (timestamp: number): string => {
  const now = Date.now();
  const diffMs = now - timestamp;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.round(diffDay / 30);

  if (diffMin < 2) {
    return `${pluralise(diffMin, 'moment')} ago`;
  } else if (diffHour < 1) {
    return `${diffMin} ${pluralise(diffMin, 'minute')} ago`;
  } else if (diffDay < 1) {
    return `${diffHour} ${pluralise(diffMin, 'hour')} ago`;
  } else if (diffDay < 5) {
    return `${diffDay} ${pluralise(diffMin, 'day')} ago`;
  } else if (diffDay < 30) {
    return `${diffWeek} ${pluralise(diffMin, 'week')} ago`;
  } else {
    return `${diffMonth} ${pluralise(diffMin, 'month')} ago`;
  }
};
