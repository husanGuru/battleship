import Room, { Ship } from "src/entities/Room";

const rooms: Room[] = [];
export function getRoomById(id: number): Room {
  const room = rooms.find((room) => room.id === id)!;
  return room;
}
export function addRoom(playerId: number) {
  rooms.push(
    new Room({
      playerId,
      id: rooms.length > 0 ? Math.max(...rooms.map((room) => room.id)) + 1 : 1,
    })
  );
}
export function addPlayerToRoom({
  indexRoom,
  playerId,
}: {
  indexRoom: number;
  playerId: number;
}) {
  const room = rooms.find((r) => r.id === indexRoom)!;
  room.players.push(playerId);

  return { idGame: room.id, idPlayer: playerId };
}
export function getFreeRooms() {
  return rooms.filter((room) => room.players.length === 1);
}
export function addShipsToRoom({
  roomId,
  ships,
  playerId,
}: {
  roomId: number;
  ships: Ship[];
  playerId: number;
}) {
  rooms.find((room) => room.id === roomId)!.addShips(ships, playerId);
}
