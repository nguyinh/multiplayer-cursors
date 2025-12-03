import { Player } from "@/entities";

import { CardBattle } from ".";

describe("Game initialization", () => {
	let game: CardBattle;

	describe("game should not have 2 players with same usernames", () => {
		game = new CardBattle();
		const player1 = new Player("username1", "socket1");
		const player2 = new Player("username1", "socket2");
		game.addPlayer(player1);
		game.addPlayer(player2);

		test("it should not allow adding a player with the same username", () => {
			expect(game.getPlayers().length).toBe(1);
		});

		test("it should not start", () => {
			const startedGame = game.startGame();
			expect(startedGame).toBeNull();
		});
	});
});

describe("CardBattle Service", () => {
	let game: CardBattle;
	let player1: Player;
	let player2: Player;

	beforeEach(() => {
		game = new CardBattle();
		player1 = new Player("Alice", "socket1");
		player2 = new Player("Bob", "socket2");
		game.addPlayer(player1);
		game.addPlayer(player2);
	});

	test("should initialize with two players", () => {
		expect(game.getPlayers().length).toBe(2);
	});

	test("should add players correctly", () => {
		const players = game.getPlayers();

		expect(players[0].get().username).toBe("Alice");
		expect(players[1].get().username).toBe("Bob");
	});

	test("should distribute cards to players", () => {
		game.startGame();
		expect(player1.hasCards()).toBe(true);
		expect(player2.hasCards()).toBe(true);
	});

	test("game should be initialized correctly", () => {
		game.startGame();
		if (!game) {
			throw new Error("Game failed to start");
		}

		expect(game).toBeInstanceOf(CardBattle);
		expect(game.getPlayers().length).toBe(2);
		expect(game.getPlayers()).toContain(player1);
		expect(game.getPlayers()).toContain(player2);
		expect(game.getHeap()).toEqual([]);
	});

	test("game should progress correctly", () => {
		game.startGame();

		game.play(player1);
		game.play(player2);

		expect(game.getHeap().length).toBe(2);
	});

	test("should play each turn correctly", () => {
		game.startGame();

		game.play(player1);
		game.play(player2);
		game.play(player2);
		game.play(player1);

		expect(game.getHeap().length).toBe(3);
	});

	test("should not allow playing out of turn", () => {
		game.startGame();

		game.play(player2); // Not player2's turn
		expect(game.getHeap().length).toBe(0);
	});

	test("game should progress correctly and determine player 1 as winner (or equality)", () => {
		game.startGame();

		let currentTurn = 0;
		const MAX_ITERATIONS = 10000;

		while (currentTurn < MAX_ITERATIONS) {
			const playerTurn = game.getPlayerTurn();
			if (playerTurn === null) {
				break;
			}

			game.play(playerTurn);

			const currentHeap = game.getHeap();
			if (currentHeap.at(-1) === currentHeap.at(-2)) {
				game.tapHeap(player1);
			}
			currentTurn++;
		}

		if (game.getPlayerTurn() === null && game.getWinner() === null) {
			expect(game.getHeap().length).toBe(52);
			expect(player1.hasCards()).toBe(false);
			expect(player2.hasCards()).toBe(false);
			return;
		}

		expect(game.getHeap().length).toBe(0);
		expect(player2.hasCards()).toBe(false);
	});

	test("game should progress correctly and randomly determine a winner (or equality)", () => {
		game.startGame();

		let watchdog = 0;
		const MAX_ITERATIONS = 10000;

		while (watchdog < MAX_ITERATIONS) {
			const playerTurn = game.getPlayerTurn();
			if (playerTurn === null) {
				break;
			}

			game.play(playerTurn);

			const currentHeap = game.getHeap();
			if (currentHeap.at(-1) === currentHeap.at(-2)) {
				const randomPlayer = Math.random() < 0.5 ? player1 : player2;
				game.tapHeap(randomPlayer);
			}
			watchdog++;
		}

		if (game.getPlayerTurn() === null && game.getWinner() === null) {
			expect(game.getHeap().length).toBe(52);
			expect(player1.hasCards()).toBe(false);
			expect(player2.hasCards()).toBe(false);
			return;
		}

		const winner = game.getWinner();
		if (!winner) return;
		const loser = game.getAdversary(winner);

		expect(winner.getCardCount()).toBe(52);
		expect(loser.getCardCount()).toBe(0);
		expect(game.getHeap().length).toBe(0);
	});
});
