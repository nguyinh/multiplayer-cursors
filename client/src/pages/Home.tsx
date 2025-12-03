import { useState } from "react";
import { useNavigate } from "react-router";

import { useAuth } from "@/contexts";
import { emitAsync } from "@/services";

function App() {
	const { username, setNuqsUsername } = useAuth();

	const [inputRoomId, setInputRoomId] = useState("");
	const navigate = useNavigate();

	const createGameLobby = async () => {
		const usernameResponse = await emitAsync<string>("lobby:set-username", {
			payload: username,
			expectResponse: true,
		});
		console.log(usernameResponse);

		const roomIdResponse = await emitAsync<string>("lobby:create-room", {
			expectResponse: true,
		});

		console.log(roomIdResponse);

		if (usernameResponse && roomIdResponse) {
			navigate(`/card-battle/${roomIdResponse}/lobby`);
			setNuqsUsername(usernameResponse);
		} else {
			console.error("Failed to create game lobby");
		}
	};

	const joinGameLobby = async () => {
		const usernameResponse = await emitAsync<string>("lobby:set-username", {
			payload: username,
			expectResponse: true,
		});
		console.log(usernameResponse);

		const roomIdResponse = await emitAsync<string>("lobby:join-room", {
			payload: inputRoomId,
			expectResponse: true,
		});

		console.log(roomIdResponse);

		if (usernameResponse && roomIdResponse) {
			navigate(`/card-battle/${roomIdResponse}/lobby`);
			setNuqsUsername(username);
		} else {
			console.error("Failed to join game lobby");
		}
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

				<button
					onClick={createGameLobby}
					disabled={!username}
					type="button"
				>
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
