import type { Cards } from "@/types";

export function generateFullDeck(): Cards {
	const deck: Cards = [];

	for (let n = 1; n < 14; n++) {
		for (let m = 0; m < 4; m++) {
			deck.push(n);
		}
	}

	return deck;
}

export function shuffle(cards: Cards): Cards {
	const shuffled = [...cards];
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}
	return shuffled;
}

export function distribute(cards: Cards): [Cards, Cards] {
	const decks: [Cards, Cards] = [[], []];

	for (let n = 0; n < cards.length; n++) {
		const cardToDistribute = cards[n];
		if (n % 2 === 0) {
			decks[0].push(cardToDistribute);
		} else {
			decks[1].push(cardToDistribute);
		}
	}
	return decks;
}
