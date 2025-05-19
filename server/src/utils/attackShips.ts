import { Ship } from "src/entities/Room";

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 10;

export const coordKey = (x: number, y: number) => `${x},${y}`;
export function getShipCoordinates(ship: Ship): [number, number][] {
  const coords: [number, number][] = [];
  for (let i = 0; i < ship.length; i++) {
    const x = ship.direction ? ship.position.x : ship.position.x + i;
    const y = ship.direction ? ship.position.y + i : ship.position.y;
    coords.push([x, y]);
  }
  return coords;
}

export function getSurroundingCells(
  coords: [number, number][]
): [number, number][] {
  const surrounding = new Set<string>();

  for (const [x, y] of coords) {
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const sx = x + dx;
        const sy = y + dy;
        surrounding.add(`${sx},${sy}`);
      }
    }
  }

  // Remove actual ship cells from surrounding set
  for (const [x, y] of coords) {
    surrounding.delete(`${x},${y}`);
  }

  return [...surrounding].map((key) => {
    const [x, y] = key.split(",").map(Number);
    return [x, y] as [number, number];
  });
}

function getAllBoardCells(): [number, number][] {
  const cells: [number, number][] = [];
  for (let x = 0; x < BOARD_WIDTH; x++) {
    for (let y = 0; y < BOARD_HEIGHT; y++) {
      cells.push([x, y]);
    }
  }
  return cells;
}

export function getRandomUnattackedCell(
  attacked: Set<string>
): [number, number] | null {
  const allCells = getAllBoardCells();
  const available = allCells.filter(([x, y]) => !attacked.has(`${x},${y}`));

  if (available.length === 0) return null;

  const randomIndex = Math.floor(Math.random() * available.length);
  return available[randomIndex];
}

export function getAllAttackedCells(
  hitMap: Map<Ship, Set<string>>
): Set<string> {
  const attacked = new Set<string>();

  for (const hitSet of hitMap.values()) {
    for (const cell of hitSet) {
      attacked.add(cell);
    }
  }

  return attacked;
}

export function isShipSunk(
  ship: Ship,
  hitMap: Map<Ship, Set<string>>
): boolean {
  const hits = hitMap.get(ship);
  if (!hits) return false;

  const coords = getShipCoordinates(ship);
  return coords.every(([x, y]) => hits.has(`${x},${y}`));
}

export function isPlayerDefeated(
  ships: Ship[],
  hitMap: Map<Ship, Set<string>>
): boolean {
  return ships.every((ship) => isShipSunk(ship, hitMap));
}
