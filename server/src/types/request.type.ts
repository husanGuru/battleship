import { Ship } from "src/entities/Room";
import { MessageTypes } from "./index.type";

export type ClientResponse = {
  type: MessageTypes;
  data:
    | RegRequestType
    | AddToRoomRequestType
    | AddShipsRequestType
    | AttackRequestType;
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
  ships: Omit<Ship, "indexPlayer">[];
  indexPlayer: number;
};
export type AttackRequestType = {
  gameId: number;
  x: number;
  y: number;
  indexPlayer: number;
};
