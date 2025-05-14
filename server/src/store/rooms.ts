import Room, { Ship } from "src/entities/Room";

const rooms: Room[] = [];
export function addRoom(playerId: number) {
  rooms.push(
    new Room({ playerId, id: Math.max(...rooms.map((room) => room.id)) + 1 })
  );
}
export function addPlayerToRoom({
  indexRoom,
  playerId,
}: {
  indexRoom: number;
  playerId: number;
}) {
  const room = rooms[indexRoom];
  room.players.push(playerId);

  return { idGame: room.id, idPlayer: playerId };
}
export function getFreeRooms() {
  return rooms.filter((room) => room.players.length === 1);
}
export function addShipsToRoom({
  roomId,
  ships,
}: {
  roomId: number;
  ships: Ship[];
}) {
  rooms.find((room) => room.id === roomId)?.addShips(ships);
}
