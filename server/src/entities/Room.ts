import Player from "./Player";

export interface Ship {
  position: { x: number; y: number };
  direction: boolean;
  length: number;
  type: "small" | "medium" | "large" | "huge"; //1 2 3 4
}
export default class Room {
  players: Player["id"][] = [];
  id: number;
  ships: Record<number, Ship[]> & { [id: number]: Ship[] } & {
    length?: never;
  } = {};
  hitMap: Record<number, Map<Ship, Set<string>>> = {};

  constructor({ playerId, id }: { id: number; playerId: number }) {
    this.players.push(playerId);
    this.id = id;
  }
  addUser(playerId: number) {
    this.players.push(playerId);
  }

  addShips(ships: Ship[], playerId: number) {
    this.ships[playerId] = ships;
    this.hitMap[playerId] = new Map();
  }
}
