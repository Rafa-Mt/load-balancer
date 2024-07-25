import { getStatus } from "./dispatcherClient";
import { getHealth } from "./healthClient";
import type { Dir, BalancerClient } from ".";

interface ResultValue {
  effectivity: number;
  activeRequests: number;
  freeMemory: number;
  cpuUsage: number;
}
type Result = Record<string, ResultValue>;

interface ArrayResult {
  effectivity: number;
  activeRequests: number;
  freeMemory: number;
  cpuUsage: number;
  addr: string;
}

type FinalTable = [
  {
    freeMemory: number;
    addr: string;
  },
  {
    activeRequest: number;
    addr: string;
  },
  {
    effectivity: number;
    addr: string;
  },
  {
    cpuUsage: number;
    addr: string;
  }
];

export const calcStatus = async (dirs: Dir[], clients: BalancerClient[]) => {
  const results: Result = {};
  const arrayResults: ArrayResult[] = [];

  for (const client of clients) {
    const { health, dispatcher } = client;

    const gottenHealth: any = await getHealth(
      health.client.client,
      health.client.service,
      health.addr
    );
    // console.log(gottenHealth, "health");
    const gottenStatus: any = await getStatus(
      dispatcher.client.client,
      dispatcher.client.service,
      dispatcher.addr
    );
    // console.log(gottenStatus, "status");
    if (!(gottenHealth instanceof Error) && !(gottenStatus instanceof Error)) {
      const res = {
        effectivity: gottenStatus[dispatcher.addr].effectivity,
        activeRequests: gottenStatus[dispatcher.addr].activeRequests,
        freeMemory: gottenHealth[health.addr].freeMemory,
        cpuUsage: gottenHealth[health.addr].cpuUsage,
      };
      const arrayRes = {
        effectivity: gottenStatus[dispatcher.addr].effectivity,
        activeRequests: gottenStatus[dispatcher.addr].activeRequests,
        freeMemory: gottenHealth[health.addr].freeMemory,
        cpuUsage: gottenHealth[health.addr].cpuUsage,
        addr: dispatcher.addr,
      };

      Object.assign(results, { [dispatcher.addr]: res });
      arrayResults.push(arrayRes);
    }
  }

  const table = Object.entries(results);
  // console.log("table:", table);

  const effectivity = arrayResults.map((entry) => {
    return { addr: entry.addr, effectivity: entry.effectivity };
  });
  const maxEffectivity = Math.max(
    ...effectivity.map((item) => item.effectivity)
  );
  const effectivityWinner = effectivity.find(
    (item) => item.effectivity === maxEffectivity
  );

  const activeRequests = arrayResults.map((entry) => {
    return { addr: entry.addr, activeRequests: entry.activeRequests };
  });
  const minActive = Math.min(
    ...activeRequests.map((item) => item.activeRequests)
  );
  const requestWinner = activeRequests.filter(
    (item) => item.activeRequests === minActive
  )[0];

  const freeMemory = arrayResults.map((entry) => {
    return {
      addr: entry.addr,
      freeMemory: entry.freeMemory < 0 ? -entry.freeMemory : entry.freeMemory,
    };
  });
  const maxMemory = Math.max(...freeMemory.map((item) => item.freeMemory));
  const memoryWinner = freeMemory.find((item) => item.freeMemory === maxMemory);

  const cpuUsage = arrayResults.map((entry) => {
    return { addr: entry.addr, cpuUsage: entry.cpuUsage };
  });
  const minCpu = Math.min(...cpuUsage.map((item) => item.cpuUsage));
  const cpuWinner = cpuUsage.find((item) => item.cpuUsage === minCpu);

  const finalTable = [
    effectivityWinner,
    requestWinner,
    memoryWinner,
    cpuWinner,
  ];

  return finalTable as FinalTable;
};

export const getWinner = (finalTable: FinalTable) => {
  // get most common address
  const addresses = finalTable.map((entry) => entry.addr);
  const winner = mode(addresses);
  return winner;
};

function mode<T extends string | number>(array: T[]): number {
  if (array.length === 0) return -1;
  const modeMap: Record<T, number> = {} as Record<T, number>;
  let maxEl = array[0],
    maxCount = 1;
  for (let i = 0; i < array.length; i++) {
    const el = array[i];
    if (modeMap[el] == null) modeMap[el] = 1;
    else modeMap[el]++;
    if (modeMap[el] > maxCount) {
      maxEl = el;
      maxCount = modeMap[el];
    }
  }
  return array.indexOf(maxEl);
}
