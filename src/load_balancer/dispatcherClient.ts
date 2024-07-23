import { DispatcherService } from "../types/dispatcher"
import RPCClient from "../rpcHelper/RPCClient"
import * as grpc from "@grpc/grpc-js";


export interface Dispatcher {
    client: RPCClient<DispatcherService>
	service: any
}

const PROTO_PATH = "./src/proto/dispatcher.proto";
const protoConfig = {
	keepCase: true,
	longs: String,
	enums: String,
	defaults: true,
	oneofs: true,
};

export const createDispatcherClient = (address: string): Dispatcher => {
	const client = new RPCClient<DispatcherService>(PROTO_PATH, "dispatcher", protoConfig);
	const service = client.getService("DispatcherService", address, grpc.credentials.createInsecure());
	return {client, service};
}

export const getStatus = async (client: RPCClient<DispatcherService>, service: any, dir: string) => {
    return new Promise((rs, rj) => {
        client.call(service, "Check", {}, (err: any, response: any) => {
            console.log('getStatus')
            if (err) {
                rj(err)
            } else {
                rs({[dir]: response});
            }
        })
    })
}