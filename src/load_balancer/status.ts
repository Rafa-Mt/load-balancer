import { getStatus } from "./dispatcherClient";
import { getHealth } from "./healthClient";
import type { Dir, BalancerClient } from ".";
import { Logger } from "../logger/logger";

interface ResultValue {
  effectivity: number;
  activeRequests: number;
  freeMemory: number;
  cpuUsage: number;
}
type Result = Record<string, ResultValue>;

export interface ArrayResult {
  effectivity: number;
  activeRequests: number;
  freeMemory: number;
  cpuUsage: number;
  addr: string;
}


interface Contender {
  addr: string;
  value: number;
}



export const calcStatus = async (dirs: Dir[], clients: BalancerClient[], logKey: string = '') => {
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

  logKey && Logger.addToEntry(logKey, 'status', arrayResults);

  const table = Object.entries(results);

  const effectivity: Contender[] = curveValues(arrayResults.map((entry) => {
    return { addr: entry.addr, value: entry.effectivity };
  }));
  const maxEffectivity = Math.max(
    ...effectivity.map((item) => item.value)
  );
  const effectivityWinner = effectivity.find(
    (item) => item.value === maxEffectivity
  );

  const activeRequests: Contender[] = curveValues(arrayResults.map((entry) => {
    return { addr: entry.addr, value: entry.activeRequests };
  }));
  const minActive = Math.min(
    ...activeRequests.map((item) => item.value)
  );
  const requestWinner = activeRequests.filter(
    (item) => item.value === minActive
  )[0];

  const freeMemory: Contender[] = curveValues(arrayResults.map((entry) => {
    return {
      addr: entry.addr,
      value: entry.freeMemory < 0 ? -entry.freeMemory : entry.freeMemory,
    };
  }));
  const maxMemory = Math.max(...freeMemory.map((item) => item.value));
  const memoryWinner = freeMemory.find((item) => item.value === maxMemory);

  const cpuUsage: Contender[] = curveValues(arrayResults.map((entry) => {
    return { addr: entry.addr, value: entry.cpuUsage };
  }));
  const minCpu = Math.min(...cpuUsage.map((item) => item.value));
  const cpuWinner = cpuUsage.find((item) => item.value === minCpu);

  const finalTable = [
    effectivityWinner,
    requestWinner,
    memoryWinner,
    cpuWinner,
  ];

  return finalTable as [Contender, Contender, Contender, Contender];
};

export const getWinner = (finalTable: [Contender, Contender, Contender, Contender], weights: [number, number, number, number] = [.25, .25, .25, .25]) => {

  const newTable = finalTable.map((item, index) => {
    return {
      addr: item.addr,
      value: item.value * weights[index],
    };
  });

  // if an addr appears more than once, sum the values
  const addrSet = new Set(newTable.map((item) => item.addr));
  const addrArray = Array.from(addrSet);
  const summedTable = addrArray.map((addr) => {
    return {
      addr: addr,
      value: newTable.filter((item) => item.addr === addr).reduce((acc, curr) => acc + curr.value, 0),
    };
  });


  // return the addr with the highest value
  const max = Math.max(...summedTable.map((item) => item.value));
  return summedTable.find((item) => item.value === max)?.addr ?? summedTable[0].addr;
 



};



const curveValues = (contenders: Contender[]) => {
  // all values between 0 and 1
  const max = Math.max(...contenders.map((item) => item.value));
  
 return contenders.map((item) => {
    return {
      addr: item.addr,
      value: item.value / max,
    };
  });
}



const main = () => {
  const contenders = [
    {
      addr: "1",
      value: 10,
    },
    {
      addr: "2",
      value: 20,
    },
    {
      addr: "3",
      value: 10,
    },
    {
      addr: "4",
      value: 10,
    },
  ]

  const curvedCont = curveValues(contenders) as [Contender, Contender, Contender, Contender];
  console.log(
    getWinner(curvedCont)
  )
}

if (require.main === module) {
  main();
}






