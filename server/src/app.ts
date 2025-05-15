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
  createRoom,
  updateRoomState,
  updateWinners,
} from "./controllers/game";
import { getRoomById } from "./store/rooms";
import { innerParse } from "./utils/innerParse";
import { innerStringify } from "./utils/innerStringify";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const PORT = 3000;

const wss = new WebSocketServer({
  port: PORT,
});

wss.on("connection", (ws: AuthedWebSocket) => {
  wss.on("error", (err) => {
    console.log(err);
  });

  ws.on("message", (data) => {
    try {
      const dataParsed: ClientResponse = innerParse(data.toString());
      console.log(dataParsed);

      switch (dataParsed.type) {
        case MessageTypes.REG: {
          const result = reg(dataParsed.data as RegRequestType, ws);
          ws.send(innerStringify(result));
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
          }
          break;
        }
        case MessageTypes.ADD_USER_TO_ROOM: {
          if (ws.playerId) {
            const result = addToRoom({
              indexRoom: (dataParsed.data as AddToRoomRequestType).indexRoom,
              playerId: ws.playerId,
            });
            ws.send(innerStringify(result));
          }
          break;
        }
        case MessageTypes.UPDATE_ROOM: {
          const result = updateRoomState();
          ws.send(innerStringify({ result }));

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
                  ships: shipsData.ships[shipsData.indexPlayer],
                },
              })
            );
          }

          break;
        }
        case MessageTypes.ATTACK: {
          const attackData = dataParsed.data as AttackRequestType;

          attack(attackData);

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
