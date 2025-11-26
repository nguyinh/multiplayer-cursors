import { useEffect } from "react";
import { socket } from "../services/socket";

export default function useSocket<T>(
	eventName: string,
	callback: (...args: T[]) => void,
) {
	useEffect(() => {
		socket.on(eventName, callback);

		return () => {
			socket.off(eventName, callback);
		};
	}, [eventName, callback]);
}
