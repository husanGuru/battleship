export function innerStringify(
  res: { data: unknown; type: string; id: number } & unknown
) {
  return JSON.stringify({ ...res, data: JSON.stringify(res.data) });
}
