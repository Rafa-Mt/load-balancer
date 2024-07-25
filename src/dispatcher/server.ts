import RPCServer from "../rpcHelper/RPCServer";
import * as grpc from "@grpc/grpc-js";
import parseArgs from "minimist";
import { DispatcherService } from "../types/dispatcher";
import { Resolver } from "@grpc/grpc-js/build/src/resolver";
import asyncQueue from "./asyncQueue";
import { response } from "express";

const queue = asyncQueue(50);

const argv = parseArgs(process.argv.slice(2), { string: "target" });
const MINPORT = 5000;
const MAXPORT = 5050;
const port = Number(argv._[0]) || 5001;
if (port < MINPORT || port > MAXPORT) {
	console.error(`Port must be between ${MINPORT} and ${MAXPORT}`);
	process.exit(1);
}
const PROTOPATH = "./src/proto/dispatcher.proto";
const server = new RPCServer();
const protoDescriptor = server.loadProtoFile(PROTOPATH, {
	keepCase: true,
	longs: String,
	enums: String,
	defaults: true,
	oneofs: true,
});

let pendingRequests = 0;
const effectivity = {
	totalAmount: 0,
	success: 0,
	failed: 0,
}
const failRate = Math.floor(Math.random() * 100)

const halt = async (seconds: number, returnValue: number, callback: any) => {
	const failChance = Math.floor(Math.random() * 100);
	return new Promise((rs, rj) => {
		console.log(effectivity, (effectivity.totalAmount - effectivity.failed) / effectivity.totalAmount)
		return setTimeout(() => {
			effectivity.totalAmount++;
			pendingRequests--;
			console.log('Halt called', {seconds, returnValue})
			if (failChance > failRate) {
				callback(null, {response: -1})	
				effectivity.failed++;
				return rs("OK")
			}
			effectivity.success++;
			callback(null, {response: returnValue});
			rs("OK")
		}, seconds*1000)
	})
}

server.addService<DispatcherService>(protoDescriptor, "dispatcher", "DispatcherService", {
	Index: (call: any, callback: any) => {
		console.log("index")
		callback
		(null, {response: port})
	},
	Check: (call: any, callback: any) => {
		// console.log(effectivity)
		const difference = (effectivity.totalAmount - effectivity.failed) / effectivity.totalAmount;
		const calculatedEffectivity = isNaN(difference) || effectivity.totalAmount === 0 ? 1 : difference;
		// console.log("calcef", calculatedEffectivity)
		callback(null, {
			effectivity: calculatedEffectivity, 
			activeRequests: pendingRequests, 
		})
	},
	Halt: async (call: any, callback: any) => {
		const { seconds, returnValue } = call.request;
		try {
			pendingRequests++;
			queue( async () => await halt(seconds, returnValue, callback))
		}
		catch(e) {
			console.log('Halt failed', e)
			callback(null, {response: -2048})
			effectivity.failed++;
		}
	},
});

server.start(`127.0.0.1:${port}`, grpc.ServerCredentials.createInsecure());