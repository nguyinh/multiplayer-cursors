import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { socket } from "../services/socket";

function App() {
	const { username, setNuqsUsername } = useAuth();

	const [inputRoomId, setInputRoomId] = useState("");
	const navigate = useNavigate();

	const createGameLobby = () => {
		socket.emit("create-room", (newRoomId: string) => {
			socket.emit(
				"set-username",
				username,
				(response: { success: boolean }) => {
					console.log(response);

					if (response.success) {
						navigate(`/realtime-cursors/${newRoomId}/lobby`);
						setNuqsUsername(username);
					} else {
						console.error("Failed to set username");
					}
				},
			);
		});
	};

	const joinGameLobby = () => {
		console.log("setting username");
		socket.emit("set-username", username, (response: { success: boolean }) => {
			console.log(response);

			if (response.success) {
				socket.emit("join-room", inputRoomId, (roomId: string) => {
					console.log(response);

					if (roomId) {
						console.log(`Joined room: ${roomId}`);
						navigate(`/realtime-cursors/${roomId}/lobby`);
						setNuqsUsername(username);
					} else {
						console.error("Failed to join room");
					}
				});
			} else {
				console.error("Failed to set username");
			}
		});
	};

	return (
		<div
			style={{
				width: "100vw",
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
			}}
		>
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					gap: 10,
					width: 200,
				}}
			>
				<p>
					Connected as <pre>{username}</pre>
				</p>

				<button onClick={createGameLobby} disabled={!username} type="button">
					Create a game
				</button>

				<h3>OR</h3>

				<form
					style={{
						display: "flex",
						flexDirection: "column",
						justifyContent: "center",
						gap: 5,
					}}
				>
					<label aria-label="room">
						Join a room:
						<input
							aria-label="room"
							onChange={(e) => {
								setInputRoomId(e.target.value);
							}}
						/>
					</label>
					<button
						type="button"
						onClick={joinGameLobby}
						disabled={!inputRoomId || !username}
					>
						Join game
					</button>
				</form>
			</div>
		</div>
	);
}

export default App;
