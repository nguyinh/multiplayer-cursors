import http from "node:http";
import cors from "cors";
import express from "express";
import { Server } from "socket.io";
import { registerSocketHandlers } from "./socket.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
	res.send({ message: "Server running" });
});

const server = http.createServer(app);
const io = new Server(server, {
	cors: { origin: "*" },
});

io.on("connection", (socket) => {
	console.log("🔌 Client connected:", socket.id);
	registerSocketHandlers(io, socket);
});

const PORT = 4000;
server.listen(PORT, () => {
	console.log(`🚀 Server running on http://localhost:${PORT}`);
});
