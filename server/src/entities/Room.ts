import Player from "./Player";

export interface Ship {
  position: { x: number; y: number };
  direction: boolean;
  length: number;
  type: "small" | "medium" | "large" | "huge";
  playerIndex: number;
}
export default class Room {
  players: Player["id"][] = [];
  id: number;
  ships: Ship[] = [];

  constructor({ playerId, id }: { id: number; playerId: number }) {
    this.players.push(playerId);
    this.id = id;
  }
  addUser(playerId: number) {
    this.players.push(playerId);
  }

  addShips(ships: Ship[]) {
    this.ships.push(...ships);
  }
}
