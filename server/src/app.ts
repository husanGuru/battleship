import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { WebSocketServer } from "ws";
import {
  AddShipsRequestType,
  AddToRoomRequestType,
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
      const dataParsed: ClientResponse = JSON.parse(data.toString());
      switch (dataParsed.type) {
        case MessageTypes.REG: {
          const result = reg(dataParsed.data as RegRequestType, ws);
          ws.send(JSON.stringify(result));
          break;
        }
        case MessageTypes.UPDATE_WINNERS: {
          const result = updateWinners();
          ws.send(JSON.stringify(result));

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
            ws.send(JSON.stringify(result));
          }
          break;
        }
        case MessageTypes.UPDATE_ROOM: {
          const result = updateRoomState();
          ws.send(JSON.stringify({ result }));

          break;
        }
        case MessageTypes.ADD_SHIPS: {
          const result = addShips(dataParsed.data as AddShipsRequestType);
          ws.send(JSON.stringify({ result }));

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
