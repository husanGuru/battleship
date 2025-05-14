import { RegRequestType } from "src/types/request.type";

import Player from "../entities/Player";

const players: Player[] = [];

export function getPlayers() {
  return players.values();
}
export function getPlayerById(playerId: number) {
  return players.find((player) => player.id === playerId);
}

export function login({ name, password }: RegRequestType) {
  let playerIndex = players.findIndex((p) => p.name === name);

  if (playerIndex === -1) {
    const newLength = players.push(
      new Player({
        name,
        password,
        id: Math.max(...players.map((p) => p.id)) + 1,
      })
    );
    playerIndex = newLength - 1;
  }
  return { ...players[playerIndex], index: playerIndex };
}
