import { useEffect, useRef } from "react";

import { useMousePosition, useSocketListener } from "@/hooks";
import { socket } from "@/services";

type Cursor = { x: number; y: number };
type UserCursor = {
	current: Cursor;
	target: Cursor;
	color: string;
	name: string;
};

const playerColors = ["red", "blue", "green", "orange", "purple"];

/**
 * Smoothing factor for exponential interpolation
 * Higher = more responsive, reduces lag
 * Lower = more smooth, causes lag
 * 12 is a good default
 */
const SMOOTHING = 12;

export default function MultiCursorCanvas({
	emulateWS,
	roomId,
}: {
	emulateWS?: boolean;
	roomId?: string;
}) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const usersRef = useRef<Record<string, UserCursor>>({});

	console.log(canvasRef.current);

	useMousePosition(canvasRef, (x, y) => {
		socket.emit("move", { x, y, roomId });
	});

	// Simulated WS updates
	useEffect(() => {
		if (emulateWS) {
			const interval = setInterval(() => {
				const users = usersRef.current;

				for (let i = 0; i < 5; i++) {
					const id = `user${i}`;
					if (!users[id]) {
						users[id] = {
							current: { x: 200, y: 200 },
							target: { x: 200, y: 200 },
							color: playerColors[i],
							name: `${playerColors[i]}`,
						};
					}

					const xTarget =
						users[id].target.x +
						(Math.random() > 0.5 ? 1 : -1) * Math.random() * 15;
					const yTarget =
						users[id].target.y +
						(Math.random() > 0.5 ? 1 : -1) * Math.random() * 15;

					users[id].target = {
						x: Math.min(Math.max(xTarget, 0), 800),
						y: Math.min(Math.max(yTarget, 0), 600),
					};
				}
			}, 50); // 20hz server updates

			return () => clearInterval(interval);
		}
	}, [emulateWS]);

	// WebSocket updates -> only update target, never current
	useSocketListener(
		"moved",
		(data: {
			playerId: string;
			username: string;
			position: { x: number; y: number };
		}) => {
			console.debug(data);

			const users = usersRef.current;

			if (!users[data.playerId]) {
				users[data.playerId] = {
					current: { x: data.position.x, y: data.position.y },
					target: { x: data.position.x, y: data.position.y },
					color: "white",
					name: `User ${data.playerId}`,
				};
			} else {
				users[data.playerId].target = { ...data.position };
				users[data.playerId].name = data.username;
			}
		},
	);

	useSocketListener(
		"player-left",
		(data: { playerId: string; username: string }) => {
			console.debug(data);

			const users = usersRef.current;

			delete users[data.playerId];
		},
	);

	// Smooth animation loop
	useEffect(() => {
		const canvas = canvasRef.current;
		const ctx = canvas?.getContext("2d");
		if (!canvas || !ctx) return;

		let last = performance.now();

		const loop = (now: number) => {
			const dt = (now - last) / 1000;
			last = now;

			ctx.clearRect(0, 0, canvas.width, canvas.height);

			const users = usersRef.current;

			for (const user of Object.values(users)) {
				// smooth exponential interpolation
				const t = 1 - Math.exp(-SMOOTHING * dt);

				user.current.x += (user.target.x - user.current.x) * t;
				user.current.y += (user.target.y - user.current.y) * t;

				ctx.beginPath();
				ctx.arc(user.current.x, user.current.y, 8, 0, Math.PI * 2);
				ctx.fillStyle = user.color;
				ctx.fill();
				ctx.font = "12px Arial";
				ctx.fillStyle = "white";
				ctx.fillText(
					user.name,
					user.current.x + 10,
					user.current.y - 10,
				);
			}

			requestAnimationFrame(loop);
		};

		requestAnimationFrame(loop);
	}, []);

	return (
		<canvas
			ref={canvasRef}
			width={800}
			height={600}
			style={{ border: "1px solid white" }}
		/>
	);
}
