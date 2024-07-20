import type { ServerUnaryCall, sendUnaryData } from "@grpc/grpc-js/build/src/server-call";
import type { requestCallback } from "@grpc/grpc-js";

export type GenericService = {
  [key: string]: ((arg: any) => any);
} & {
  serviceName: string;
  packageName: string
};

// server
export type ServiceImplementation<T extends GenericService> = {
  [P in keyof Omit<T, 'serviceName' | 'packageName'>]: T[P] extends (arg: infer Req) => infer Res
    ? (
      call: ServerUnaryCall<Req, Res>, 
      callback: sendUnaryData<Req>
    ) => void
    : never;
};


//client
export type ExtractRequestType<T, K extends keyof T> = T[K] extends (
  request: infer R
) => any
  ? R
  : never;
export type ExtractResponseType<T, K extends keyof T> = T[K] extends (
  request: any
) => infer R
  ? R
  : never;

export type ServiceClient<T extends GenericService> = {
  call: <
    K extends keyof T
  >(
    service: any,
    rpc: K,
    req: ExtractRequestType<T, K>,
    callback: requestCallback<ExtractResponseType<T, K>>
  ) => void;
  [key: string]: any;
};



