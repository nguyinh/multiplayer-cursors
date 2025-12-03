import type { Server, Socket } from "socket.io";
import { logger } from "../logger";
import { CardBattle } from "../card-battle";
import type { PlayerSocket } from "src/types/sockets";
import { Player } from "@/entities";

function getPlayer(socket: Pick<Socket, "id" | "data">): PlayerSocket {
	return {
		socketId: socket.id,
		username: socket.data.username || "Anonymous",
	};
}

function formatPlayer(
	socket: Socket,
	{ withSocketId } = { withSocketId: false },
): string {
	return `'${socket.data.username || "Anonymous"}'${withSocketId ? ` [${socket.id}]` : ""}`;
}

const games: Map<string, CardBattle> = new Map();

export function registerSocketHandlers(io: Server, socket: Socket) {
	// -------- Lobby events --------
	socket.on(
		"lobby:set-username",
		(username: string, callback: (username: string) => void) => {
			logger.debug(`Set username '${username}' for socket [${socket.id}]`);
			socket.data.username = username;
			callback(username);
		},
	);

	socket.on("lobby:create-room", (callback: (roomId: string) => void) => {
		const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
		logger.debug(`Room created: ${roomId} by ${formatPlayer(socket)}`);

		socket.join(roomId);
		callback(roomId);
	});

	socket.on(
		"lobby:join-room",
		(roomId: string, callback: (roomId: string) => void) => {
			logger.debug(`Player ${formatPlayer(socket)} joining room: ${roomId}`);

			socket.join(roomId);

			io.to(roomId).emit("lobby:player-joined", {
				playerId: socket.id,
				username: socket.data.username,
				roomId,
			});
			callback(roomId);
		},
	);

	socket.on("lobby:leave-room", () => {
		socket.rooms.forEach((roomId) => {
			logger.debug(`Player ${formatPlayer(socket)} leaving room: ${roomId}`);
			socket.leave(roomId);
			io.to(roomId).emit("lobby:player-left", {
				playerId: socket.id,
				roomId: roomId,
			});
		});
	});

	socket.on(
		"lobby:get-room-members",
		async (roomId: string, callback: (ids: PlayerSocket[]) => void) => {
			const sockets = (await io.in(roomId).fetchSockets()) as unknown as Pick<
				Socket,
				"id" | "data"
			>[];

			const socketPlayers = sockets.map((socket) => getPlayer(socket));
			console.log(socketPlayers);

			callback(socketPlayers);
		},
	);

	socket.on("lobby:start-game", (roomId: string) => {
		logger.debug(
			`Player ${formatPlayer(socket)} starting game in room: ${roomId}`,
		);
		io.to(roomId).emit("lobby:game-started", roomId);

		// Get sockets in the room
		const roomSockets = Array.from(
			io.sockets.adapter.rooms.get(roomId) || [],
		).map((socketId) => getPlayer(io.sockets.sockets.get(socketId) as Socket));

		const game = new CardBattle();
		roomSockets.forEach((playerSocket) => {
			const player = new Player(playerSocket.username, playerSocket.socketId);
			game.addPlayer(player);
		});
		game.startGame();
		games.set(roomId, game);
	});

	// -------- Game events --------

	// socket.on("buzz", () => {
	// 	console.log(`Player ${socket.id} buzzed!`);
	// 	io.emit("buzzed", { playerId: socket.id, timestamp: Date.now() });
	// });

	// socket.on("move", (payload: { x: number; y: number; roomId: string }) => {
	// 	const { x, y, roomId } = payload;
	// 	const position = { x, y };

	// 	console.log(`Player ${socket.data.username} moved to:`, position);

	// 	socket.to(roomId).emit("moved", {
	// 		playerId: socket.id,
	// 		username: socket.data.username,
	// 		timestamp: Date.now(),
	// 		position,
	// 	});
	// });

	// socket.on("start-game", (roomId: string) => {
	// 	console.log(`Game started in room:`, roomId);

	// 	io.to(roomId).emit("game-started", roomId);
	// });

	// socket.on(
	// 	"set-username",
	// 	(username: string, callback: (response: { success: boolean }) => void) => {
	// 		console.log(`🆔 Player ${socket.id} set username to: ${username}`);
	// 		socket.data.username = username;
	// 		callback({ success: true });
	// 	},
	// );

	// socket.on("create-room", (callback: (roomId: string) => void) => {
	// 	const roomId = Math.random().toString(36).substring(2, 8);
	// 	console.log(`Room created: ${roomId} by ${socket.id}`);

	// 	socket.join(roomId);

	// 	console.log(`Notify players: player-joined ${roomId} by ${socket.id}`);
	// 	socket.to(roomId).emit("player-joined", {
	// 		playerId: socket.id,
	// 		username: socket.data.username,
	// 		roomId,
	// 	});

	// 	callback(roomId);
	// });

	// socket.on(
	// 	"join-room",
	// 	(roomId: string, callback: (roomId: string) => void) => {
	// 		console.log(`Player ${socket.data.username} joined room ${roomId}`);

	// 		socket.join(roomId);

	// 		console.log(
	// 			`Notify players: player-joined ${roomId} by ${socket.data.username}`,
	// 		);
	// 		socket.to(roomId).emit("player-joined", {
	// 			playerId: socket.id,
	// 			username: socket.data.username,
	// 			roomId,
	// 		});

	// 		callback(roomId);
	// 	},
	// );

	// socket.on(
	// 	"get-room-members",
	// 	async (roomId: string, callback: (ids: string[]) => void) => {
	// 		const sockets = await io.in(roomId).fetchSockets();

	// 		const usernames = sockets.map((socket) => socket.data.username);
	// 		callback(usernames);
	// 	},
	// );

	// socket.on("leave", () => {
	// 	const rooms = socket.rooms;
	// 	if (rooms) {
	// 		rooms.forEach((roomId) => {
	// 			socket.leave(roomId);
	// 			console.log(`Player ${socket.data.username} left room ${roomId}`);

	// 			console.log(
	// 				`Notify players: player-left ${roomId} by ${socket.data.username}`,
	// 			);
	// 			socket.to(roomId).emit("player-left", {
	// 				playerId: socket.id,
	// 				username: socket.data.username,
	// 				roomId,
	// 			});
	// 		});
	// 		rooms.clear();
	// 	}
	// });

	// socket.on("disconnect", () => {
	// 	console.log(`❌ Client disconnected: ${socket.id}`);

	// 	console.log(socket.rooms);
	// 	socket.rooms.forEach((roomId) => {
	// 		if (roomId !== socket.id) {
	// 			console.log(`📣 Notify players: player-left ${roomId} by ${socket.id}`);
	// 			socket.to(roomId).emit("player-left", {
	// 				playerId: socket.id,
	// 				roomId,
	// 			});
	// 		}
	// 	});
	// });
}
