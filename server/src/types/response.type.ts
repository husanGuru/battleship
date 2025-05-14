import { MessageTypes } from "./index.type";

export type ServerResponse = {
  type: MessageTypes;
  data: unknown;
  id: 0;
};

export type RegResponseType = {
  name: string;
  index: number | string;
  error: boolean;
  errorText: string;
};
