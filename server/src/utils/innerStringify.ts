export function innerStringify(res: { data: unknown } & unknown) {
  return JSON.stringify({ ...res, data: JSON.stringify(res.data) });
}
