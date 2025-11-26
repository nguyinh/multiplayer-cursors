import { useEffect } from "react";

const FREQUENCY = 40;

export function useMousePosition(
	canvasRef: React.RefObject<HTMLCanvasElement | null>,
	onMouseMove: (x: number, y: number) => void,
) {
	useEffect(() => {
		const canvas = canvasRef?.current;
		if (!canvas) return; // wait until mounted

		let lastSent = 0;

		const handleMove = (e: MouseEvent) => {
			const rect = canvas.getBoundingClientRect();
			const x = e.clientX - rect.left;
			const y = e.clientY - rect.top;

			const now = performance.now();
			if (now - lastSent > 1000 / FREQUENCY) {
				onMouseMove(x, y);
				lastSent = now;
			}
		};

		canvas.addEventListener("mousemove", handleMove);

		return () => {
			canvas.removeEventListener("mousemove", handleMove);
		};
	}, [canvasRef, onMouseMove]);
}
