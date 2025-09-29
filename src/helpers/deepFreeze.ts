export function deepFreeze<T extends object>(obj: T): Readonly<T> {
  Object.keys(obj).forEach(prop => {
    const value = obj[prop as keyof T];
    if (typeof value === 'object' && value !== null) deepFreeze(value);
  });
  return Object.freeze(obj);
}
