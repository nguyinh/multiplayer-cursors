import { useParams } from "react-router";

import { useSocketContext } from "@/contexts";

export default function CardBattle() {
	const { roomId } = useParams();
	const { players } = useSocketContext();

	if (!roomId) {
		return <div>No room ID provided.</div>;
	}

	return <div>Card Battle Game Page</div>;
}
