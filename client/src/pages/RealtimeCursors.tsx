import { useEffect } from "react";
import { useParams } from "react-router";

import { useAuth } from "@/contexts";
import { socket } from "@/services";

import MultiCursorCanvas from "../components/MultiCursorCanvas";

export default function RealtimeCursors() {
	const { roomId } = useParams<{ roomId?: string }>();
	const { username } = useAuth();

	useEffect(() => {
		socket.emit(
			"set-username",
			username,
			(response: { success: boolean }) => {
				if (!response.success) {
					console.error("Failed to set username");
					return;
				}
				console.debug(`🆔 Successfully usernamed: ${username}`);

				socket.emit("join-room", roomId, (newRoomId: string) => {
					console.debug(`🚪 Joined room: ${newRoomId}`);
				});
			},
		);

		window.addEventListener("beforeunload", () => {
			socket.emit("leave");
		});

		return () => {
			// leave when component unmounts
			window.removeEventListener("beforeunload", () => {
				console.debug(`👋 Leaving room: ${roomId}`);
				socket.emit("leave");
			});

			socket.emit("leave");
		};
	}, [roomId, username]);

	return (
		<>
			<a href={`/?username=${username}`}>
				<button type="button">Back</button>
			</a>
			<MultiCursorCanvas emulateWS={false} roomId={roomId} />
		</>
	);
}
