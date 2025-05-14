import { MessageTypes } from "./index.type";

export type ClientResponse = {
  type: MessageTypes;
  data: RegRequestType | AddToRoomRequestType | AddShipsRequestType;
  id: 0;
};

export type RegRequestType = {
  name: string;
  password: string;
};
export type AddToRoomRequestType = {
  indexRoom: number;
};
export type AddShipsRequestType = {
  gameId: number;
  ships: {
    position: { x: number; y: number };
    direction: boolean;
    length: number;
    type: "small" | "medium" | "large" | "huge";
  }[];
  indexPlayer: number;
};
