import type { Socket } from "socket.io";

export type PlayerSocket = {
	socketId: Socket["id"];
	username: string;
};
