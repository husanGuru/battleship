import { Ship } from "src/entities/Room";

export type AttackFeedback = {
  type: "miss" | "shot" | "killed";
  x: number;
  y: number;
};

export type AttackResult = {
  feedback: AttackFeedback[]; // contains at least one entry
  hitShip?: Ship; // if a ship was hit
};
