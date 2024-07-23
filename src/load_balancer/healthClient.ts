import RPCClient from "../rpcHelper/RPCClient";
import * as grpc from "@grpc/grpc-js";
import { HealthService } from "../types/health";
import { BidiStreamingHandler } from "@grpc/grpc-js/build/src/server-call";

export interface Health {
	client: RPCClient<HealthService>
	service: any
}

const PROTO_PATH = "./src/proto/health.proto";
const protoConfig = {
	keepCase: true,
	longs: String,
	enums: String,
	defaults: true,
	oneofs: true,
};

export const createHealthClient = (address: string): Health => {
	const client = new RPCClient<HealthService>(PROTO_PATH, "health", protoConfig);
	const service = client.getService("HealthService", address, grpc.credentials.createInsecure());
	return {client, service};
}

export const getHealth = async (client: RPCClient<HealthService>, service:any, dir: string) => {
    return new Promise((rs, rj) => {
        client.call(service, "Check", {}, (err: any, response: any) => {
            if (err) {
                rj(err)
            } else {
                rs({[dir]: response});
            }
        })
    })
}