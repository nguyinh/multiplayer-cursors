import { Cards } from "..";
import { Player } from "./";

describe("Player Entity", () => {
	const username = "testUser";
	const socketId = "socket123";
	let player: Player;

	beforeEach(() => {
		player = new Player(username, socketId);
	});

	test("should initialize with empty deck", () => {
		expect(player.hasCards()).toBe(false);
	});

	test("should receive cards", () => {
		const deck = Cards.generateFullDeck();
		const shuffledDeck = Cards.shuffle(deck);
		const [player1Cards] = Cards.distribute(shuffledDeck);

		player.giveCards(player1Cards);
		expect(player.hasCards()).toBe(true);
	});

	test("should play a card", () => {
		const deck = Cards.generateFullDeck();
		const shuffledDeck = Cards.shuffle(deck);
		const [player1Cards] = Cards.distribute(shuffledDeck);
		player.giveCards(player1Cards);

		const playedCard = player.playCard();
		expect(playedCard).toEqual(player1Cards[0]);
		expect(player.hasCards()).toBe(true);
	});

	test("should return null when playing a card from an empty deck", () => {
		const playedCard = player.playCard();
		expect(playedCard).toBeNull();
	});
});
