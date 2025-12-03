import type { PlayerSocket } from "../types";

export function addPlayer(player: PlayerSocket, playerList: PlayerSocket[]) {
	const exists = playerList.find(
		(p) => p.socketId === player.socketId || p.username === player.username,
	);
	if (!exists) {
		return [...playerList, player];
	}
	return playerList;
}

export function removePlayer(playerId: string, playerList: PlayerSocket[]) {
	return playerList.filter((player) => player.socketId !== playerId);
}
