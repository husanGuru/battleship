import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { WebSocketServer } from "ws";
import {
  AddShipsRequestType,
  AddToRoomRequestType,
  AttackRequestType,
  ClientResponse,
  RegRequestType,
} from "./types/request.type";
import { AuthedWebSocket, MessageTypes } from "./types/index.type";
import reg from "./controllers/reg";
import {
  addShips,
  addToRoom,
  attack,
  createRoom,
  updateRoomState,
  updateWinners,
} from "./controllers/game";
import { getRoomById } from "./store/rooms";
import { innerParse } from "./utils/innerParse";
import { innerStringify } from "./utils/innerStringify";
import {
  getAllAttackedCells,
  getRandomUnattackedCell,
  isPlayerDefeated,
} from "./utils/attackShips";
import { addWinners } from "./store/winners";
import { getPlayerById } from "./store/players";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const PORT = 3000;

const wss = new WebSocketServer({
  port: PORT,
});

const users = new Map<number, AuthedWebSocket>();

wss.on("connection", (ws: AuthedWebSocket) => {
  wss.on("error", (err) => {
    console.log(err);
  });

  ws.on("message", async (data) => {
    try {
      const dataParsed: ClientResponse = innerParse(data.toString());
      console.log(dataParsed);

      switch (dataParsed.type) {
        case MessageTypes.REG: {
          const result = reg(dataParsed.data as RegRequestType, ws);

          if (!result.data.error && result.data.index) {
            users.set(result.data.index, ws);
          }
          ws.send(innerStringify(result));

          const availableRooms = updateRoomState();
          const winners = updateWinners();

          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(innerStringify(availableRooms));
              client.send(innerStringify(winners));
            }
          });

          break;
        }
        case MessageTypes.CREATE_ROOM: {
          if (ws.playerId) {
            createRoom(ws.playerId);
            const availableRooms = updateRoomState();

            wss.clients.forEach((client) => {
              if (client.readyState === WebSocket.OPEN) {
                client.send(innerStringify(availableRooms));
              }
            });
          }
          break;
        }
        case MessageTypes.UPDATE_WINNERS: {
          const result = updateWinners();
          ws.send(innerStringify(result));

          break;
        }
        case MessageTypes.CREATE_GAME: {
          if (ws.playerId) {
            createRoom(ws.playerId);
            const result = updateRoomState();

            ws.send(innerStringify(result));
          }
          break;
        }
        case MessageTypes.ADD_USER_TO_ROOM: {
          if (ws.playerId) {
            const result = addToRoom({
              indexRoom: (dataParsed.data as AddToRoomRequestType).indexRoom,
              playerId: ws.playerId,
            });
            const availableRooms = updateRoomState();

            wss.clients.forEach((client) => {
              if (client.readyState === WebSocket.OPEN) {
                client.send(innerStringify(availableRooms));
              }
            });

            ws.send(innerStringify(result));
            const hostPlayerId = getRoomById(result.data.idGame).players.find(
              (player) => player !== result.data.idPlayer
            )!;
            users.get(hostPlayerId)?.send(
              innerStringify({
                ...result,
                data: {
                  idGame: result.data.idGame,
                  idPlayer: hostPlayerId,
                },
              })
            );
          }
          break;
        }
        case MessageTypes.UPDATE_ROOM: {
          const result = updateRoomState();
          ws.send(innerStringify(result));

          break;
        }
        case MessageTypes.ADD_SHIPS: {
          const shipsData = dataParsed.data as AddShipsRequestType;
          addShips(shipsData);

          const room = getRoomById(shipsData.gameId);

          if (room && Object.keys(room.ships).length > 1) {
            ws.send(
              innerStringify({
                type: MessageTypes.START_GAME,
                data: {
                  ships: shipsData.ships,
                  currentPlayerIndex: shipsData.indexPlayer,
                },
                id: 0,
              })
            );

            const hostPlayerId = room.players.find(
              (player) => player !== shipsData.indexPlayer
            )!;
            users.get(hostPlayerId)?.send(
              innerStringify({
                type: MessageTypes.START_GAME,
                data: {
                  ships: room.ships[hostPlayerId],
                  currentPlayerIndex: hostPlayerId,
                },
                id: 0,
              })
            );

            ws.send(
              innerStringify({
                type: MessageTypes.TURN,
                data: {
                  currentPlayerIndex: shipsData.indexPlayer,
                },
                id: 0,
              })
            );

            users.get(hostPlayerId)?.send(
              innerStringify({
                type: MessageTypes.TURN,
                data: {
                  currentPlayerIndex: shipsData.indexPlayer,
                },
                id: 0,
              })
            );
          }

          break;
        }
        case MessageTypes.ATTACK: {
          const attackData = dataParsed.data as AttackRequestType;

          const result = attack(attackData);

          result.feedback.forEach((feedback) => {
            ws.send(
              innerStringify({
                type: MessageTypes.ATTACK,
                data: {
                  position: { x: feedback.x, y: feedback.y },
                  currentPlayer: ws.playerId,
                  status: feedback.type,
                },
                id: 0,
              })
            );
          });

          const room = getRoomById(attackData.gameId);
          const hostPlayerId = room.players.find(
            (player) => player !== ws.playerId
          )!;

          const isNext = !result.feedback.find(
            (feedback) => feedback.type === "shot" || feedback.type === "kill"
          );

          users.get(hostPlayerId)?.send(
            innerStringify({
              type: MessageTypes.TURN,
              data: {
                currentPlayer: isNext ? hostPlayerId : ws.playerId,
              },
              id: 0,
            })
          );

          ws.send(
            innerStringify({
              type: MessageTypes.TURN,
              data: {
                currentPlayer: isNext ? hostPlayerId : ws.playerId,
              },
              id: 0,
            })
          );

          if (result.feedback.find((feedback) => feedback.type === "kill")) {
            const player1Defeated = isPlayerDefeated(
              room.ships[ws.playerId!],
              room.hitMap[ws.playerId!]
            );
            const player2Defeated = isPlayerDefeated(
              room.ships[hostPlayerId],
              room.hitMap[hostPlayerId]
            );
            const gameFinished = player1Defeated || player2Defeated;

            if (gameFinished) {
              addWinners({
                name: player1Defeated
                  ? getPlayerById(ws.playerId!)!.name
                  : getPlayerById(hostPlayerId)!.name,
              });
              users.get(hostPlayerId)?.send(
                innerStringify({
                  type: MessageTypes.FINISH,
                  data: {
                    winPlayer: player1Defeated ? ws.playerId! : hostPlayerId,
                  },
                  id: 0,
                })
              );

              ws.send(
                innerStringify({
                  type: MessageTypes.FINISH,
                  data: {
                    winPlayer: player1Defeated ? ws.playerId! : hostPlayerId,
                  },
                  id: 0,
                })
              );

              const winners = updateWinners();

              wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                  client.send(innerStringify(winners));
                }
              });
            }
          }

          break;
        }
        case MessageTypes.RANDOM_ATTACK: {
          const attackData = dataParsed.data as {
            gameId: number;
            indexPlayer: number;
          };

          const attackedCells = getAllAttackedCells(
            getRoomById(attackData.gameId).hitMap[attackData.indexPlayer]
          );
          const randomUnattackedCell = getRandomUnattackedCell(attackedCells);
          if (randomUnattackedCell?.length === 2) {
            const result = attack({
              ...attackData,
              x: randomUnattackedCell[0],
              y: randomUnattackedCell[1],
            });

            result.feedback.forEach((feedback) => {
              ws.send(
                innerStringify({
                  type: MessageTypes.ATTACK,
                  data: {
                    position: { x: feedback.x, y: feedback.y },
                    currentPlayer: ws.playerId,
                    status: feedback.type,
                  },
                  id: 0,
                })
              );
            });

            const isNext = !result.feedback.find(
              (feedback) => feedback.type === "shot" || feedback.type === "kill"
            );

            const room = getRoomById(attackData.gameId);
            const hostPlayerId = room.players.find(
              (player) => player !== ws.playerId
            )!;
            users.get(hostPlayerId)?.send(
              innerStringify({
                type: MessageTypes.TURN,
                data: {
                  currentPlayer: isNext ? hostPlayerId : ws.playerId,
                },
                id: 0,
              })
            );

            ws.send(
              innerStringify({
                type: MessageTypes.TURN,
                data: {
                  currentPlayer: isNext ? hostPlayerId : ws.playerId,
                },
                id: 0,
              })
            );

            if (result.feedback.find((feedback) => feedback.type === "kill")) {
              const player1Defeated = isPlayerDefeated(
                room.ships[ws.playerId!],
                room.hitMap[ws.playerId!]
              );
              const player2Defeated = isPlayerDefeated(
                room.ships[hostPlayerId],
                room.hitMap[hostPlayerId]
              );
              const gameFinished = player1Defeated || player2Defeated;

              if (gameFinished) {
                addWinners({
                  name: player1Defeated
                    ? getPlayerById(ws.playerId!)!.name
                    : getPlayerById(hostPlayerId)!.name,
                });

                users.get(hostPlayerId)?.send(
                  innerStringify({
                    type: MessageTypes.FINISH,
                    data: {
                      winPlayer: player1Defeated ? ws.playerId! : hostPlayerId,
                    },
                    id: 0,
                  })
                );

                ws.send(
                  innerStringify({
                    type: MessageTypes.FINISH,
                    data: {
                      winPlayer: player1Defeated ? ws.playerId! : hostPlayerId,
                    },
                    id: 0,
                  })
                );

                const winners = updateWinners();

                wss.clients.forEach((client) => {
                  if (client.readyState === WebSocket.OPEN) {
                    client.send(innerStringify(winners));
                  }
                });
              }
            }
          }

          break;
        }
        default:
          break;
      }
    } catch (err) {
      console.log(err);
    }
  });
});
