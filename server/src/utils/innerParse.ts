export function innerParse(data: string) {
  const outerParsed = JSON.parse(data);

  let innerParsed;
  try {
    innerParsed = outerParsed.data ? JSON.parse(outerParsed.data) : null;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_e: unknown) {
    innerParsed = null;
  }

  return {
    ...outerParsed,
    data: innerParsed,
  };
}
