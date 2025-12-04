import { useEffect, useState } from "react";
import { useParams } from "react-router";

import { useSocketContext, useNotification } from "@/contexts";
import { useSocketListener } from "@/hooks";
import { emitAsync } from "@/services";

import type { PlayerSocket } from "../types";

export default function CardBattle() {
	const { roomId } = useParams();
	const { players } = useSocketContext();
	const [currentTurn, setCurrentTurn] = useState<
		PlayerSocket["socketId"] | null
	>(null);
	const [heapCard, setHeapCard] = useState<number | null>(null);
	const { addNotification } = useNotification();

	useEffect(() => {
		emitAsync("game:get-state", { payload: roomId, expectResponse: false });
	}, [roomId]);

	useSocketListener<{
		currentTurn: PlayerSocket | null;
		heapCard: number | null;
	}>("game:state", ({ currentTurn, heapCard }) => {
		setCurrentTurn(currentTurn?.socketId || null);
		setHeapCard(heapCard || null);
	});

	useSocketListener<{
		currentTurn: PlayerSocket | null;
		heapCard: number | null;
	}>("game:state", ({ currentTurn, heapCard }) => {
		setHeapCard(heapCard);

		addNotification("Heap card updated!");
	});

	useSocketListener<{
		winner: PlayerSocket | null;
		loser: PlayerSocket | null;
		currentTurn: PlayerSocket | null;
	}>("game:tap-result", (result) => {
		console.log("Tap result:", result);
		addNotification("test");
	});

	if (!roomId) {
		return <div>No room ID provided.</div>;
	}

	const playCard = async () => {
		try {
			await emitAsync("game:play-card", {
				payload: roomId,
				expectResponse: false,
			});
		} catch (error) {
			console.error("Error playing card:", error);
		}
	};

	const tapHeap = async () => {
		try {
			await emitAsync("game:tap-heap", {
				payload: roomId,
				expectResponse: false,
			});
		} catch (error) {
			console.error("Error tapping heap:", error);
		}
	};

	return (
		<div>
			<h2>Card Battle Game Page</h2>
			<div>
				<span style={{ opacity: 0.7 }}>Current player turn</span>{" "}
				<b style={{ fontSize: 18 }}>
					{
						players.find(
							(player) => player.socketId === currentTurn,
						)?.username
					}
				</b>
			</div>
			<div style={{ display: "flex", alignItems: "center", gap: 10 }}>
				<span style={{ opacity: 0.7 }}>Current heap card</span>{" "}
				{heapCard && (
					<div
						style={{
							width: 10,
							height: 40,
							background: "white",
							color: "black",
							fontSize: 24,
							fontWeight: 800,
							padding: "20px 20px",
							display: "flex",
							flexDirection: "column",
							justifyContent: "center",
							alignItems: "center",
							borderRadius: 4,
							border: "1px solid black",
						}}
					>
						{heapCard}
					</div>
				)}
			</div>
			<button type="button" onClick={playCard}>
				Play a card
			</button>
			<button type="button" onClick={tapHeap}>
				Tap heap
			</button>
		</div>
	);
}
