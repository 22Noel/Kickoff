import express from 'express';
import userRouter from './routes/users.js';
import matchRouter from './routes/matches.js';
import cors from 'cors';

let corsOptions;

//   console.log("Running in development mode");
//   corsOptions = {
//     origin: "http://localhost:5173",
//     methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
//     credentials: true,
corsOptions = {
  origin: ["http://frontend:80", "http://localhost:5173", "http://localhost:80"],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
};

const app = express();
app.use(cors(corsOptions));

app.use(express.json());
app.use("/api/users", userRouter);
app.use("/api/matches", matchRouter);

const port = Number(process.env.BACKEND_PORT) || 3000;

app.get('/status', (req, res) => {
  res.status(200).send('Ok');
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
});

export default app;
