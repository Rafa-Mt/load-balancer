import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { ServiceImplementation, GenericService } from './types/customTypes';


class RPCServer {
  private server: grpc.Server;

  constructor() {
    this.server = new grpc.Server();
  }

  start(
    address: string,
    credentials: grpc.ServerCredentials,
  ) {
    this.server.bindAsync(address, credentials, () => {
      console.log(`Server running at ${address}`);
    });
  }
  loadProtoFile(protoPath: string, options: protoLoader.Options) {
    const packageDefinition = protoLoader.loadSync(protoPath, options);
    const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
    return protoDescriptor;
  }
  addService<Service extends GenericService>(
    protoDescriptor: any,
    packageName: Service['packageName'],
    serviceName: Service['serviceName'],
    service: ServiceImplementation<Service>,
  ) {
    this.server.addService(protoDescriptor[packageName][serviceName].service, service);
  }
}

export default RPCServer;

