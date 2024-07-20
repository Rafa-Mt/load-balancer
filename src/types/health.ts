interface CheckResponse {
  freeMemory: number;
  cpuUsage: number;
}

export type HealthService = {
  Check(request: {}): CheckResponse;
  serviceName: "HealthService";
  packageName: "health";
  [key: string]: any;
}

