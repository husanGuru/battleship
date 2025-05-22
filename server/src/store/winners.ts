import Winner from "src/entities/Winner";

const winners: Winner[] = [];

export function getWinners() {
  return winners;
}
export function addWinners({ name }: { name: string }) {
  const winnerIndex = winners.findIndex((w) => w.name === name);
  if (winnerIndex !== -1) {
    winners[winnerIndex].wins++;
  } else {
    winners.push(new Winner({ name, wins: 1 }));
  }
}
