import { getPlayerById } from "src/store/players";
import {
  addPlayerToRoom,
  addRoom,
  addShipsToRoom,
  getFreeRooms,
} from "src/store/rooms";
import { getWinners } from "src/store/winners";
import { MessageTypes } from "src/types/index.type";
import { AddShipsRequestType } from "src/types/request.type";

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
      roomUsers: room.players.map((player, index) => ({
        name: getPlayerById(player)?.name,
        index,
      })),
    })),
    id: 0,
  };
}
export function addShips(data: AddShipsRequestType) {
  addShipsToRoom({ roomId: data.gameId, ships: data.ships });
  
}
