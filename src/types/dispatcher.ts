interface CheckResponse {
	efectivity: number;
	activeRequests: number;
}

interface HaltRequest {
	seconds: number,
	returnValue: number
}

interface HaltResponse {
	response: number
}

export type DispatcherService = {
	[key: string]: any;
	Check(request: {}): CheckResponse;
	Halt(request: HaltRequest): HaltResponse;
	serviceName: "DispatcherService";
	packageName: "dispatcher";
}