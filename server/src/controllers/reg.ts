import { login } from "src/store/players";
import { AuthedWebSocket, MessageTypes } from "src/types/index.type";
import { RegRequestType } from "src/types/request.type";

export default function reg(data: RegRequestType, ws: AuthedWebSocket) {
  if (!data?.name || !data?.password) {
    return {
      type: MessageTypes.REG,
      data: {
        error: true,
        errorText: "Name or password not provided",
      },
    };
  }
  const player = login(data);
  ws.playerId = player.id;
  return {
    type: MessageTypes.REG,
    data: {
      name: player.name,
      index: player.index,
      error: false,
      errorText: "",
    },
  };
}
