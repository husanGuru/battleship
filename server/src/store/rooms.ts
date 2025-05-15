import Room, { Ship } from "src/entities/Room";

const rooms: Room[] = [];
export function getRoomById(id: number): Room | null {
  const room = rooms.find((room) => room.id === id);
  return room ?? null;
}
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
  playerId,
}: {
  roomId: number;
  ships: Ship[];
  playerId: number;
}) {
  rooms.find((room) => room.id === roomId)?.addShips(ships, playerId);
}
