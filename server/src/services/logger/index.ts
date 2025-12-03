import pino from "pino";
import { prettyFactory } from "pino-pretty";

let hooks: pino.LoggerOptions["hooks"] | undefined;

if (process.env.NODE_ENV === "test") {
	const prettify = prettyFactory({
		sync: true,
		colorize: true,
	});
	hooks = {
		streamWrite: (s) => {
			console.log(prettify(s)); // Mirror to console.log during tests
			return "";
		},
	};
}

export const logger = pino({
	level: process.env.LOG_LEVEL || "info",
	timestamp: false,
	base: {
		pid: false,
	},
	transport:
		process.env.NODE_ENV === "development"
			? {
					target: "pino-pretty",
					options: { colorize: true },
				}
			: undefined,
	...(hooks ? { hooks } : {}),
});
