import { io } from "socket.io-client";

export const socket = io(`${import.meta.env.VITE_SERVER_URL}`);

interface EmitOptions {
	payload?: unknown;
	expectResponse?: boolean;
	timeout?: number; // in ms
}

export function emitAsync<T = unknown>(
	event: string,
	options?: EmitOptions,
): void | Promise<T> {
	const { payload, expectResponse, timeout = 5000 } = options || {};

	if (expectResponse) {
		return new Promise<T>((resolve, reject) => {
			let timer: ReturnType<typeof setTimeout> | undefined;

			if (timeout > 0) {
				timer = setTimeout(
					() => reject(new Error("Socket emit timeout")),
					timeout,
				);
			}

			const callback = (response: T & { error?: unknown }) => {
				if (timer) clearTimeout(timer);

				// Reject if the server sends an error
				if (response?.error) {
					reject(response.error);
				} else {
					resolve(response);
				}
			};

			if (payload === undefined) {
				console.debug(`🛜 [Socket](${event})`);
				socket.emit(event, callback);
			} else {
				console.debug(`🛜 [Socket](${event})`);
				socket.emit(event, payload, callback);
			}
		});
	}

	// Fire-and-forget
	if (payload === undefined) {
		console.debug(`🛜 [Socket](${event})`);
		socket.emit(event);
	} else {
		console.debug(`🛜 [Socket](${event})`);
		socket.emit(event, payload);
	}
}
