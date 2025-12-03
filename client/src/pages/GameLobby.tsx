import { useNavigate, useParams } from "react-router";

import { useAuth, useSocketContext } from "@/contexts";
import { useSocketListener } from "@/hooks";
import { emitAsync } from "@/services";

export default function GameLobby() {
	const { username, setNuqsUsername } = useAuth();
	const { roomId } = useParams();
	const navigate = useNavigate();
	const { players } = useSocketContext();

	useSocketListener("lobby:game-started", (roomId: string) => {
		console.debug(`✅ Game started in room: ${roomId}`);

		navigate(`/card-battle/${roomId}/game`);
		setNuqsUsername(username);
	});

	if (!roomId) {
		return <div>No room ID provided.</div>;
	}

	const handleStartGame = () => {
		emitAsync("lobby:start-game", { payload: roomId });
	};

	return (
		<div>
			<h2>Game Lobby</h2>
			<p>Room ID: {roomId}</p>
			<p>Waiting for other players to join...</p>
			<ul id="player-list">
				{players.map((player) => (
					<li key={player.socketId}>{player.username}</li>
				))}
			</ul>
			<button id="start-game" type="button" onClick={handleStartGame}>
				Start Game
			</button>
		</div>
	);
}
