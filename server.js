const WebSocket = require("ws");

const PORT = process.env.PORT || 3000;
const wss = new WebSocket.Server({ port: PORT });

let users = new Map();

wss.on("connection", ws => {
  ws.on("message", msg => {
    let data;
    try {
      data = JSON.parse(msg);
    } catch {
      return;
    }

    // join user
    if (data.type === "join") {
      users.set(ws, data.name);
      broadcast({
        type: "users",
        users: [...users.values()]
      });
    }

    // message
    if (data.type === "msg") {
      broadcast({
        from: users.get(ws) || "anon",
        message: data.message
      });
    }
  });

  ws.on("close", () => {
    users.delete(ws);
    broadcast({
      type: "users",
      users: [...users.values()]
    });
  });
});

function broadcast(obj) {
  const msg = JSON.stringify(obj);
  for (const c of wss.clients) {
    if (c.readyState === WebSocket.OPEN) {
      c.send(msg);
    }
  }
}

console.log("WSS server running");
