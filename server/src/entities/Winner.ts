export default class Winner {
  name: string;
  wins: number;

  constructor({ name, wins }: { name: string; wins: number }) {
    this.name = name;
    this.wins = wins;
  }
}
