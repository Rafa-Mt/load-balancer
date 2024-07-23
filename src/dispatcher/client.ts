import RPCClient from "../rpcHelper/RPCClient";
import * as grpc from "@grpc/grpc-js";
import {  DispatcherService} from "../types/dispatcher";



const config = {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
};

const addresses = [
 "127.0.0.1:5002", "127.0.0.1:5012",
]
const PROTO_PATH = "./src/proto/dispatcher.proto";


const client = new RPCClient<DispatcherService>(PROTO_PATH, "dispatcher", config);

const dispatcherService = client.getService("DispatcherService", addresses[0], grpc.credentials.createInsecure());

client.call(dispatcherService, "Check", {}, (err, response) => {
  if (err) {
    console.error(err);
  } else {
    console.log(response);
  }
})