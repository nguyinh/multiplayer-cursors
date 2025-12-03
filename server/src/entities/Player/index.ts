import type { Card, Cards } from "@/types";

export class Player {
	private readonly deck: Cards = [];

	constructor(
		private readonly username: string,
		private readonly socketId: string,
	) {}

	giveCards(cards: Cards) {
		this.deck.push(...cards);
	}

	playCard(): Card | null {
		if (this.deck.length > 0) {
			const card = this.deck.shift();

			return card ?? null;
		}

		return null;
	}

	hasCards(): boolean {
		return this.deck.length > 0;
	}

	getCardCount(): number {
		return this.deck.length;
	}

	get(): {
		username: string;
		socketId: string;
	} {
		return {
			username: this.username,
			socketId: this.socketId,
		};
	}
}
