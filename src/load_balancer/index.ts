import express from "express";
import { createHealthClient, getHealth, Health } from "./healthClient";
import { createDispatcherClient, getStatus } from "./dispatcherClient";
import { calcStatus } from "./status";

const app = express();
const port = 3001;
const host = "localhost";
app.use(express.json())
  
export interface Dir {
	health: string,
	dispatcher: string
}
export interface BalancerClient {
	health: {
		client: any,
		addr: string
	},
	dispatcher: {
		client: any,
		addr: string
	}
}
let dirs: Dir[] =[]
type Client = Record<string, any>;

const clients: BalancerClient[] = []

app.post("/load-dirs", (req: express.Request, res: express.Response) => {
	dirs = req.body.dirs
	dirs.forEach((addr, index) => {
		const health = createHealthClient(addr['health'])
		const dispatcher = createDispatcherClient(addr['dispatcher'])
		clients.push({
			health: {
				client: health,
				addr: addr['health']
			},
			dispatcher: {
				client: dispatcher,
				addr: addr['dispatcher']
			}
		})
	})
	console.log(`dirs ${dirs.join(", ")} added`)
	res.setHeader('Content-Type', 'application/json');
	res.send(JSON.stringify({status: "recieved"}))
})

app.get("/check-dirs", (req: express.Request, res: express.Response) => {
	res.setHeader('Content-Type', 'application/json');
	console.log(clients)
	res.send(JSON.stringify(dirs));
})

app.get("/", (req: express.Request, res: express.Response) => {
  	res.redirect('/status');
});

app.get('/status', async (req: express.Request, res: express.Response) => {
	res.setHeader('Content-Type', 'application/json');
	const finalTable = await calcStatus(dirs, clients)
	res.send(JSON.stringify(finalTable))
})

app.post('/halt', async (req: express.Request, res: express.Response) => {
	res.send('X')
})

app.get('/clear-console', (req: express.Request, res: express.Response) => {
	console.clear()
	res.send('Console Cleared')
})

app.listen(port, host, () => {
  	console.log(`Server is running on http://${host}:${port}`);
});