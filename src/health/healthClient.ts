import RPCClient from "../rpcHelper/RPCClient";
import * as grpc from "@grpc/grpc-js";

const config = {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
};

const addresses = ["127.0.0.1:5001", "127.0.0.1:5002", "127.0.0.1:5003"];
const PROTO_PATH = "../../protos/health.proto";

export const client = new RPCClient(PROTO_PATH, "health", config);

addresses.forEach((address) => {
  const healthService = client.getService(
    "HealthService",
    address,
    grpc.credentials.createInsecure()
  );
  client.call(
    healthService,
    "Check",
    {},
    (err: any, response: any) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log(`Address: ${address}`);
      console.log(`Free Memory: ${response?.freeMemory}`);
      console.log(`CPU Usage: ${response?.cpuUsage}`);
      console.log("================================");
    }
  );
});
