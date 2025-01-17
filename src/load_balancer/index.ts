import express from "express";
import { createHealthClient, getHealth, Health } from "./healthClient";
import {
  createDispatcherClient,
  Dispatcher,
  getStatus,
} from "./dispatcherClient";
import { calcStatus, getWinner } from "./status";
import RPCClient from "../rpcHelper/RPCClient";
import { DispatcherService } from "../types/dispatcher";
import { HealthService } from "../types/health";
import { Logger } from "../logger/logger";

const app = express();
const port = 3001;
const host = "localhost";
app.use(express.json());

export interface Dir {
  health: string;
  dispatcher: string;
}
export interface BalancerClient {
  health: {
    client: Health;
    addr: string;
  };
  dispatcher: {
    client: Dispatcher;
    addr: string;
  };
}
let dirs: Dir[] = [];
type Client = Record<string, any>;

const clients: BalancerClient[] = [];

const statusRoute = async (logKey: string = '') => {
  const finalTable = await calcStatus(dirs, clients, logKey);
  const winner = getWinner(finalTable, [.5, .5, 0, 0]);
  return winner;
};

app.post("/load-dirs", (req: express.Request, res: express.Response) => {
  dirs = req.body.dirs;
  dirs.forEach((addr) => {
    const health = createHealthClient(addr["health"]);
    const dispatcher = createDispatcherClient(addr["dispatcher"]);
    clients.push({
      health: {
        client: health,
        addr: addr["health"],
      },
      dispatcher: {
        client: dispatcher,
        addr: addr["dispatcher"],
      },
    });
  });
  console.log(`dirs added: `, dirs);
  res.setHeader("Content-Type", "application/json");
  res.send(JSON.stringify({ status: "recieved" }));
});

app.get("/check-dirs", (req: express.Request, res: express.Response) => {
  res.setHeader("Content-Type", "application/json");
  console.log(dirs);
  res.send(JSON.stringify(dirs));
});

app.get("/", (req: express.Request, res: express.Response) => {
  res.redirect("/status");
});

app.get("/status", async (req: express.Request, res: express.Response) => {
	res.setHeader("Content-Type", "application/json");
  if (clients.length === 0) {
    res.send(JSON.stringify({ status: "No clients added" }));
		return;
  }
  const winner = await statusRoute();
  res.send(JSON.stringify(winner));
});

app.post("/halt", async (req: express.Request, res: express.Response) => {
	const logKey = new Date().toISOString();
	Logger.createEntry(logKey);

	res.setHeader("Content-Type", "application/json");
  if (clients.length === 0) {
    res.send(JSON.stringify({ status: "No clients added" }));
		return;
  }
  const { seconds, returnValue } = req.body;
  const winnerDispatcherAddr = await statusRoute(logKey);
	console.log("winner: ", winnerDispatcherAddr);
  const winner = clients.find(
    (client) => client.dispatcher.addr === winnerDispatcherAddr
  ) as BalancerClient;
	Logger.addToEntry(logKey, 'winner', winnerDispatcherAddr);
	Logger.saveEntry(logKey);
  const service = winner.dispatcher.client.service;
  winner.dispatcher.client.client.call(
    service,
    "Halt",
    { seconds, returnValue },
    (err: any, response: any) => {
      console.log(response);
      const result = {result: response.response === -1 ? "Failed" : "Success"};
			res.send(JSON.stringify({ status: "Enqueued", response, seconds, result, winnerDispatcherAddr }));
    }
  );
});

app.get("/clear-console", (req: express.Request, res: express.Response) => {
  console.clear();
  res.send("Console Cleared");
});

app.listen(port, host, () => {
	console.log(`Server is running on http://${host}:${port}`);
});
