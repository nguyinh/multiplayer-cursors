import type { Cards } from "@/types";
import { distribute, generateFullDeck, shuffle } from "./";

const BASE_DECK: Cards = [
	1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 6, 7, 7,
	7, 7, 8, 8, 8, 8, 9, 9, 9, 9, 10, 10, 10, 10, 11, 11, 11, 11, 12, 12, 12, 12,
	13, 13, 13, 13,
] as const;

test("it should generate a full deck", () => {
	const deck = generateFullDeck();
	expect(deck.length).toBe(52);
	expect(deck).toEqual(expect.arrayContaining(BASE_DECK));
});

test("it should shuffle the deck", () => {
	const deck = generateFullDeck();
	const shuffledDeck = shuffle(deck);
	expect(shuffledDeck).toEqual(expect.arrayContaining(BASE_DECK));
	expect(shuffledDeck).not.toEqual(BASE_DECK);
});

test("it correctly distribute cards on a fresh deck", () => {
	const deck = generateFullDeck();
	const shuffledDeck = shuffle(deck);
	const [deck1, deck2] = distribute(shuffledDeck);
	expect(deck1.length).toEqual(deck2.length);
	expect(deck1.length + deck2.length).toEqual(BASE_DECK.length);
	expect([...deck1, ...deck2]).toEqual(expect.arrayContaining(BASE_DECK));
});
