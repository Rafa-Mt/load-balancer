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
	failed: 1,
}

const halt = async (seconds: number, returnValue: number, callback: any) => {
	return new Promise((rs, rj) => {
		return setTimeout(() => {
			pendingRequests--;
			console.log('Halt called', {seconds, returnValue})
			callback(null, {response: returnValue});
		}, seconds)
	})
}

server.addService<DispatcherService>(protoDescriptor, "dispatcher", "DispatcherService", {
	Index: (call: any, callback: any) => {
		console.log("index")
		callback
		(null, {response: port})
	},
	Check: (call: any, callback: any) => {
		callback(null, {
			effectivity: effectivity.totalAmount / effectivity.failed, 
			activeRequests: effectivity.totalAmount - pendingRequests, 
		})
	},
	Halt: async (call: any, callback: any) => {
		const { seconds, returnValue } = call.request;
		try {
			pendingRequests++;
			effectivity.totalAmount++;
			queue( async () => await halt(seconds, returnValue, callback))
			effectivity.success++;
		}
		catch(e) {
			callback(null, {response: -2048})
		}
	},
});

server.start(`127.0.0.1:${port}`, grpc.ServerCredentials.createInsecure());