import {
	type ReactNode,
	createContext,
	useContext,
	useEffect,
	useState,
} from "react";
import { useParams } from "react-router";

import { useAuth } from "./AuthContext";
import { useSocketListener } from "../hooks/useSocketListener";
import { emitAsync, socket } from "../services/socket";
import type { PlayerSocket } from "../types";
import { addPlayer, removePlayer } from "../utils/players";

interface SocketContextType {
	players: PlayerSocket[];
	setUsername: (username: string) => void;
	createRoom: () => Promise<string | null>;
	joinRoom: (roomId: string) => Promise<string | null>;
	getRoomMembers: (roomId: string) => Promise<PlayerSocket[]>;
}

const SocketContext = createContext<SocketContextType | null>(null);

interface SocketProviderProps {
	children: ReactNode;
}

async function setUsername(username: string) {
	const usernameResponse = await emitAsync<string>("lobby:set-username", {
		payload: username,
		expectResponse: true,
	});
	console.log(usernameResponse);
}

async function createRoom(): Promise<string | null> {
	try {
		const createdRoomId = await emitAsync<string>("lobby:create-room", {
			expectResponse: true,
		});
		return createdRoomId ?? null;
	} catch (error) {
		console.error("Error creating room:", error);
		return null;
	}
}

async function joinRoom(roomId: string): Promise<string | null> {
	try {
		const joinedRoomId = await emitAsync<string>("lobby:join-room", {
			payload: roomId,
			expectResponse: true,
		});
		return joinedRoomId ?? null;
	} catch (error) {
		console.error("Error joining room:", error);
		return null;
	}
}

async function getRoomMembers(roomId: string): Promise<PlayerSocket[]> {
	try {
		const members = await emitAsync<PlayerSocket[]>(
			"lobby:get-room-members",
			{
				payload: roomId,
				expectResponse: true,
			},
		);
		return members ?? [];
	} catch (error) {
		console.error("Error getting room members:", error);
		return [];
	}
}

export const SocketProvider = ({ children }: SocketProviderProps) => {
	const { username } = useAuth();
	const { roomId } = useParams();
	const [players, setPlayers] = useState<PlayerSocket[]>([]);

	const handleReconnection = (callback: (attempt: number) => void) => {
		if (!socket) return;

		// Remove any previous listener to avoid duplicates
		socket.off("reconnect");

		socket.io.on("reconnect", async (attemptNumber: number) => {
			console.log("reconnecting");

			if (username) {
				await setUsername(username);
			}

			if (roomId) {
				await joinRoom(roomId);
			}

			if (roomId) {
				const members = await getRoomMembers(roomId);
				setPlayers(members);
			}

			callback(attemptNumber);
		});
	};

	useEffect(() => {
		console.log("Detected useEffect for username", username);
		if (username) {
			console.log("Setting username as", username);
			setUsername(username);
		}
	}, [username]);

	useEffect(() => {
		if (roomId) {
			console.log("Setting room ID as", roomId);
			joinRoom(roomId).then(async (roomId) => {
				if (!roomId) {
					return;
				}

				const members = await getRoomMembers(roomId);
				console.log("Fetched room members:", members);
				setPlayers(members);
			});
		}
	}, [roomId]);

	useSocketListener(
		"lobby:player-joined",
		(data: { playerId: string; username: string; roomId: string }) => {
			console.debug(
				`✅ Player ${data.username} joined room ${data.roomId}`,
			);

			setPlayers((prev) =>
				addPlayer(
					{
						socketId: data.playerId,
						username: data.username,
					},
					prev,
				),
			);
		},
	);

	useSocketListener(
		"lobby:player-left",
		(data: { playerId: string; roomId: string }) => {
			console.debug(
				`❌ Player ${data.playerId} left room ${data.roomId}`,
			);

			console.log(data);

			setPlayers((prev) => removePlayer(data.playerId, prev));
		},
	);

	// biome-ignore lint/correctness/useExhaustiveDependencies: Because. Ok ?
	useEffect(() => {
		window.addEventListener("beforeunload", () => {
			emitAsync("lobby:leave-room", {
				expectResponse: false,
			});
		});

		handleReconnection((reconnectionAttemptCount) => {
			console.warn(
				"reconnected after",
				reconnectionAttemptCount,
				"attempts",
			);
		});

		return () => {
			console.debug(`👋 Leaving room: ${roomId}`);

			emitAsync("lobby:leave-room", {
				expectResponse: false,
			});
			window.removeEventListener("beforeunload", () => {});
		};
	}, []);

	return (
		<SocketContext.Provider
			value={{
				players,
				setUsername,
				createRoom,
				joinRoom,
				getRoomMembers,
			}}
		>
			{children}
		</SocketContext.Provider>
	);
};

export const useSocketContext = () => {
	const context = useContext(SocketContext);
	if (!context)
		throw new Error("useSocket must be used within SocketProvider");
	return context;
};
