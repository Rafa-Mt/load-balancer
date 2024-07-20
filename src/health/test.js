const os = require('os');
const osu = require('node-os-utils');

console.log(os.cpus());
console.log(os.totalmem());
console.log(os.freemem());

var cpu = osu.cpu;

cpu.usage().then((info) => {
  console.log(info);
});