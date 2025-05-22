export default class Player {
  name: string;
  password: string;
  id: number;
  constructor({
    name,
    password,
    id,
  }: {
    name: string;
    password: string;
    id: number;
  }) {
    this.id = id;
    this.name = name;
    this.password = password;
  }
}
