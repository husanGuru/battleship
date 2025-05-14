import { WebSocket } from "ws";

export enum MessageTypes {
  REG = "reg",
  CREATE_GAME = "create_game",
  ADD_USER_TO_ROOM = "add_user_to_room",
  START_GAME = "start_game",
  ADD_SHIPS = "add_ships",
  TURN = "turn",
  ATTACK = "attack",
  FINISH = "finish",
  UPDATE_ROOM = "update_room",
  UPDATE_WINNERS = "update_winners",
}

export type AuthedWebSocket = WebSocket & {
  playerId?: number;
  roomId?: string;
};
