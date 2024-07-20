import e from "express";

const app = e();
const port = 3000;
const host = "localhost";

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
});