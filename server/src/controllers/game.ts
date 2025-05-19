import { getPlayerById } from "src/store/players";
import {
  addPlayerToRoom,
  addRoom,
  addShipsToRoom,
  getFreeRooms,
  getRoomById,
} from "src/store/rooms";
import { getWinners } from "src/store/winners";
import { AttackFeedback } from "src/types/attack.type";
import { MessageTypes } from "src/types/index.type";
import { AddShipsRequestType, AttackRequestType } from "src/types/request.type";
import {
  coordKey,
  getShipCoordinates,
  getSurroundingCells,
} from "src/utils/attackShips";

export function updateWinners() {
  return {
    type: MessageTypes.UPDATE_WINNERS,
    data: getWinners(),
    id: 0,
  };
}
export function createRoom(playerId: number) {
  addRoom(playerId);
}

export function addToRoom({
  indexRoom,
  playerId,
}: {
  indexRoom: number;
  playerId: number;
}) {
  const { idGame, idPlayer } = addPlayerToRoom({ indexRoom, playerId });

  return {
    type: MessageTypes.CREATE_GAME,
    data: {
      idGame,
      idPlayer,
    },
    id: 0,
  };
}
export function updateRoomState() {
  const freeRooms = getFreeRooms();

  return {
    type: MessageTypes.UPDATE_ROOM,
    data: freeRooms.map((room) => ({
      roomId: room.id,
      roomUsers: room.players.map((player) => ({
        name: getPlayerById(player)?.name,
        index: getPlayerById(player)?.id,
      })),
    })),
    id: 0,
  };
}
export function addShips(data: AddShipsRequestType) {
  addShipsToRoom({
    roomId: data.gameId,
    ships: data.ships,
    playerId: data.indexPlayer,
  });
}

export function attack(data: AttackRequestType) {
  const room = getRoomById(data.gameId);
  const enemyId = room.players.find((p) => p !== data.indexPlayer)!;
  const enemyShips = room.ships[enemyId];

  for (const ship of enemyShips) {
    const coords = getShipCoordinates(ship);

    if (coords.some(([x, y]) => x === data.x && y === data.y)) {
      // Hit found
      const key = coordKey(data.x, data.y);
      const hits = room.hitMap[enemyId]?.get(ship) ?? new Set<string>();
      hits.add(key);
      room.hitMap[enemyId].set(ship, hits);

      const allHit = coords.every(([x, y]) => hits.has(coordKey(x, y)));
      if (allHit) {
        const surroundingCells = getSurroundingCells(coords);
        const feedback: AttackFeedback[] = [
          { type: "killed", x: data.x, y: data.y },
          ...surroundingCells.map(
            ([x, y]): AttackFeedback => ({ type: "miss", x, y })
          ),
        ];
        return { feedback, hitShip: ship };
      } else {
        return {
          feedback: [{ type: "shot", x: data.x, y: data.y }],
          hitShip: ship,
        };
      }
    }
  }

  return {
    feedback: [{ type: "miss", x: data.x, y: data.y }],
  };
}
