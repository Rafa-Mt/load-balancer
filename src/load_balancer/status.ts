import { getStatus } from "./dispatcherClient";
import { getHealth } from "./healthClient";
import type { Dir, BalancerClient } from ".";

export const calcStatus = async (dirs:Dir[], clients:BalancerClient[]) => {
    const results: any = {};

	clients.forEach(async client => {
		const {health, dispatcher} = client

		const gottenHealth: any = await getHealth(health.client.client, health.client.service, health.addr)
		const gottenStatus: any = await getStatus(dispatcher.client.client, dispatcher.client.service, dispatcher.addr)
			if (!(gottenHealth instanceof Error) && !(gottenStatus instanceof Error))
				Object.assign(results, {[dispatcher.addr]: {
					effectivity: gottenStatus.effectivity,
					activeRequests: gottenStatus.activeRequests,
					freeMemory: gottenHealth.freeMemory,
					cpuUsage: gottenHealth.cpuUsage
				}})
	})


	// for (let dir of dirs) {
	// 	const {health, dispatcher} = clients[dir];
	// 	console.log(clients[dir])
	// 	return
	// 	const gottenHealth:any = await getHealth(health.client, health.service, dir);
	// 	const gottenStatus:any = await getStatus(dispatcher.client, dispatcher.service, dir);

	const table = Object.entries(results);
	
	const effectivity = table.map((entry:any) => Object.fromEntries([entry[0], entry[1].effectivity]))
	const maxEffectivity = Math.max(...effectivity.map((item) => item.effectivity));
	const effectivityWinner = effectivity.filter((item) => item.effectivity === maxEffectivity)

	const activeRequests = table.map((entry:any) => Object.fromEntries([entry[0], entry[1].activeRequests]))
	const minActive = Math.min(...activeRequests.map((item) => item.activeRequests))
	const requestWinner = activeRequests.filter((item) => item.activeRequests === minActive)

	const freeMemory = table.map((entry:any) => Object.fromEntries([entry[0], entry[1].freeMemory]))
	const maxMemory = Math.max(...freeMemory.map((item) => item.freeMemory))
	const memoryWinner = freeMemory.filter((item) => item.freeMemory === maxMemory)

	const cpuUsage = table.map((entry:any) => Object.fromEntries([entry[0], entry[1].cpuUsage]))
	const minCpu = Math.min(...cpuUsage.map((item) => item.cpuUsage))
	const cpuWinner = cpuUsage.filter((item) => item.cpuUsage === minCpu)

	const finalTable = [ effectivityWinner, requestWinner, memoryWinner, cpuWinner ];
	const keys = finalTable.map((column) => column.keys())

	console.log("results:", finalTable)
}