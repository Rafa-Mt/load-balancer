// example usage

import RPCServer from "../rpcHelper/RPCServer";
import * as grpc from "@grpc/grpc-js";
import { freemem } from "os";
import * as osu from "node-os-utils";
import parseArgs from "minimist";
import { HealthService } from "../types/health";

const argv = parseArgs(process.argv.slice(2), { string: "target" });
const MINPORT = 5000;
const MAXPORT = 5050;
const port = Number(argv._[0]) || 5001;
if (port < MINPORT || port > MAXPORT) {
  console.error(`Port must be between ${MINPORT} and ${MAXPORT}`);
  process.exit(1);
}
const PROTOPATH = "../protos/health.proto";
const server = new RPCServer();
const protoDescriptor = server.loadProtoFile(PROTOPATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

server.addService<HealthService>(protoDescriptor, "health", "HealthService", {
  Check: (call, callback) => {
    osu.cpu.usage().then((cpuUsage) => {
      callback(null, {
        freeMemory: freemem(),
        cpuUsage: cpuUsage,
      });
    });
  },
});

server.start(`127.0.0.1:${port}`, grpc.ServerCredentials.createInsecure());
