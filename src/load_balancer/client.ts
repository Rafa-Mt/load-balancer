// fetch multiple times localhost:3001/halt concurrently

const getHalt = async (seconds: number, returnValue: number) => {
  const response = await fetch("http://localhost:3001/halt", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ seconds, returnValue }),
  });
  return response.json();
}

const main = async () => {
  const promises: Promise<any>[] = [];
  for (let i = 0; i < 10; i++) {
    const seconds = Math.floor(Math.random() * 10) + 1;
    getHalt(seconds, 1).then((response) => {
      console.log(response);
    });
  }
  
}
main();