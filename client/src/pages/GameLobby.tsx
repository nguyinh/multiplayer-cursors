/** biome-ignore-all lint/correctness/useHookAtTopLevel: Ignore  */
/** biome-ignore-all lint/correctness/useExhaustiveDependencies: Ignore  */
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import useSocket from "../hooks/useSocket";
import { socket } from "../services/socket";

function addPlayer(playerId: string, playerList: string[]) {
	const playerSet = new Set(playerList);
	playerSet.add(playerId);
	return Array.from(playerSet);
}

function removePlayer(playerId: string, playerList: string[]) {
	return playerList.filter((id) => id !== playerId);
}

export default function GameLobby() {
	const { username, setNuqsUsername } = useAuth();
	const { roomId } = useParams();
	const [playerList, setPlayerList] = useState<string[]>([]);
	const navigate = useNavigate();

	if (!roomId) {
		return <div>No room ID provided.</div>;
	}

	useEffect(() => {
		socket.emit("set-username", username, (response: { success: boolean }) => {
			if (!response.success) {
				console.error("Failed to set username");
				return;
			}
			console.debug(`🆔 Successfully usernamed: ${username}`);

			socket.emit("join-room", roomId, (newRoomId: string) => {
				console.debug(`🚪 Joined room: ${newRoomId}`);

				socket.emit("get-room-members", roomId, (memberIds: string[]) => {
					console.debug(`👯‍♀️ Room members: ${memberIds.join(", ")}`);
					setPlayerList(memberIds);
				});
			});
		});
	}, [roomId]);

	useSocket(
		"player-joined",
		(data: { playerId: string; username: string; roomId: string }) => {
			console.debug(`✅ Player ${data.username} joined room ${data.roomId}`);

			setPlayerList((prev) => addPlayer(data.username, prev));
		},
	);

	useSocket("player-left", (data: { playerId: string; roomId: string }) => {
		console.debug(`❌ Player ${data.playerId} left room ${data.roomId}`);

		setPlayerList((prev) => removePlayer(data.playerId, prev));
	});

	useSocket("game-started", (roomId: string) => {
		console.debug(`✅ Game started in room: ${roomId}`);
		// navigate to game page

		navigate(`/realtime-cursors/${roomId}/game`);
		setNuqsUsername(username);
	});

	useEffect(() => {
		window.addEventListener("beforeunload", () => {
			socket.emit("leave");
		});

		return () => {
			window.removeEventListener("beforeunload", () => {
				socket.emit("leave");
			});
			console.debug(`👋 Leaving room: ${roomId}`);
		};
	}, []);

	const handleStartGame = () => {
		socket.emit("start-game", roomId);
	};

	return (
		<div>
			<h2>Game Lobby</h2>
			<p>Room ID: {roomId}</p>
			<p>Waiting for other players to join...</p>
			<ul id="player-list">
				{playerList.map((playerId) => (
					<li key={playerId}>{playerId}</li>
				))}
			</ul>
			<button id="start-game" type="button" onClick={handleStartGame}>
				Start Game
			</button>
		</div>
	);
}
