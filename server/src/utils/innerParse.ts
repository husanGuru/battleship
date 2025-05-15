export function innerParse(data: string) {
  const parsed = JSON.parse(data);

  return {
    ...parsed,
    data: JSON.parse(parsed.data),
  };
}
