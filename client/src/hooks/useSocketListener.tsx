import { useEffect } from "react";

import { socket } from "@/services";

export function useSocketListener<T>(
	eventName: string,
	callback: (...args: T[]) => void,
) {
	// biome-ignore lint/correctness/useExhaustiveDependencies: Because. Ok ?
	useEffect(() => {
		socket.on(eventName, callback);

		return () => {
			socket.off(eventName, callback);
		};
	}, [eventName]);
}
