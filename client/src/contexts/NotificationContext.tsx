import { AnimatePresence, motion } from "motion/react";
import {
	type ReactNode,
	createContext,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";

interface Notification {
	id: string;
	message: string;
	duration?: number;
}

interface NotificationContextValue {
	addNotification: (message: string, duration?: number) => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(
	null,
);

export function useNotification() {
	const ctx = useContext(NotificationContext);
	if (!ctx)
		throw new Error(
			"useNotification must be used within <NotificationProvider>",
		);
	return ctx;
}

export function NotificationProvider({ children }: { children: ReactNode }) {
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const timersRef = useRef<Record<string, number>>({});

	const addNotification = (message: string, duration = 3000) => {
		console.log("addNotification()");

		const id = Math.random().toString(36).slice(2);
		setNotifications((prev) => [...prev, { id, message, duration }]);

		// schedule removal
		const timer = window.setTimeout(() => {
			setNotifications((prev) => prev.filter((t) => t.id !== id));
			delete timersRef.current[id];
		}, duration);

		timersRef.current[id] = timer;
	};

	const removeNotification = (id: string) => {
		setNotifications((prev) => prev.filter((t) => t.id !== id));
		const timer = timersRef.current[id];
		if (timer) {
			clearTimeout(timer);
			delete timersRef.current[id];
		}
	};

	// cleanup on unmount
	useEffect(() => {
		return () => {
			Object.values(timersRef.current).forEach((t) => clearTimeout(t));
			timersRef.current = {};
		};
	}, []);

	return (
		<NotificationContext.Provider value={{ addNotification }}>
			{children}

			{/* Notification container */}
			<div
				style={{
					position: "fixed",
					bottom: "24px",
					left: "50%",
					transform: "translateX(-50%)",
					display: "flex",
					flexDirection: "column",
					gap: "12px",
					zIndex: 50,
					pointerEvents: "none",
				}}
				className="fixed bottom-6 left-1/2 -translate-x-1/2 flex flex-col gap-3 z-50 pointer-events-none"
			>
				<AnimatePresence>
					{notifications.map((notification) => (
						<motion.div
							key={notification.id}
							initial={{ x: "100vw" }}
							animate={{ x: "-100vw" }}
							transition={{
								duration: 2.5,
								ease: [0.9, 0.0, 0.1, 1.0], // fast → slow → fast
							}}
							// initial={{ opacity: 0, y: 20, scale: 0.98 }}
							// animate={{ opacity: 1, y: 0, scale: 1 }}
							// exit={{ opacity: 0, y: 20, scale: 0.98 }}
							// transition={{
							// 	type: "spring",
							// 	bounce: 0.25,
							// 	duration: 0.35,
							// }}
							className="pointer-events-auto bg-neutral-900 text-white px-4 py-3 rounded-xl shadow-lg text-sm min-w-[200px] text-center"
							style={{
								pointerEvents: "auto",
								backgroundColor: "#171717", // neutral-900
								color: "white",
								padding: "12px 16px",
								borderRadius: "0.75rem",
								boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
								fontSize: "0.875rem",
								minWidth: "200px",
								textAlign: "center",
							}}
							role="status"
							aria-live="polite"
							onClick={() => removeNotification(notification.id)}
						>
							{notification.message}
						</motion.div>
					))}
				</AnimatePresence>
			</div>
		</NotificationContext.Provider>
	);
}

// Example usage inside your app — wrapped correctly in the provider
export function DemoNotificationButtonWrapper() {
	return (
		<NotificationProvider>
			<DemoNotificationButton />
		</NotificationProvider>
	);
}

function DemoNotificationButton() {
	const { addNotification } = useNotification();

	return (
		<button
			type="button"
			className="px-4 py-2 bg-blue-600 text-white rounded-xl"
			onClick={() => addNotification("This is a Motion notification!")}
		>
			Show Notification
		</button>
	);
}
