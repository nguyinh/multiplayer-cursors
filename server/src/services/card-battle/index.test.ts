import { Player } from "@/entities";

import { CardBattle } from ".";

describe("Game initialization", () => {
	let game: CardBattle;

	describe("when game has 2 players with same usernames", () => {
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

	describe("when game is correctly initialized", () => {
		let player1: Player;
		let player2: Player;

		beforeEach(() => {
			game = new CardBattle();
			player1 = new Player("Alice", "socket1");
			player2 = new Player("Bob", "socket2");
			game.addPlayer(player1);
			game.addPlayer(player2);
		});

		test("it should initialize with two players", () => {
			expect(game.getPlayers().length).toBe(2);
		});

		test("it should add players correctly", () => {
			const players = game.getPlayers();

			expect(players[0].get().username).toBe("Alice");
			expect(players[1].get().username).toBe("Bob");
		});

		test("current turn should not be defined if game has not started", () => {
			const currentTurn = game.getPlayerTurn();

			expect(currentTurn).toBeNull();
		});

		test("game should be initialized correctly", () => {
			game.startGame();

			expect(game).toBeInstanceOf(CardBattle);
			expect(game.getPlayers().length).toBe(2);
			expect(game.getPlayers()).toContain(player1);
			expect(game.getPlayers()).toContain(player2);
			expect(game.getHeap()).toEqual([]);
			expect(player1.getCardCount()).toEqual(26);
			expect(player2.getCardCount()).toEqual(26);
		});

		test("it should distribute cards to players", () => {
			game.startGame();

			expect(player1.hasCards()).toBe(true);
			expect(player2.hasCards()).toBe(true);
			expect(player1.getCardCount()).toEqual(26);
			expect(player2.getCardCount()).toEqual(26);
		});
	});
});

describe("Game Mechanics", () => {
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
		game.play(player1);
		game.play(player2);
		game.play(player1);

		expect(game.getHeap().length).toBe(5);
	});

	test("player should lose round if playing out his turn", () => {
		game.startGame();

		const currentTurnPlayer = game.getPlayerTurn();

		expect(currentTurnPlayer).toBeInstanceOf(Player);

		if (!currentTurnPlayer) {
			throw new Error("Current turn player is null");
		}

		const nonTurnPlayer = game.getAdversary(currentTurnPlayer);

		const result = game.play(nonTurnPlayer);

		expect(game.getHeap().length).toBe(0);
		expect(result.winner).toBe(currentTurnPlayer);
		expect(result.loser).toBe(nonTurnPlayer);
		expect(result.currentTurn).toBe(currentTurnPlayer);
	});

	test("adversary should get heap cards if player plays out of turn", () => {
		game.startGame();

		game.play(player1);
		game.play(player2);
		game.play(player1);
		game.play(player2);
		game.play(player1);

		const currentTurnPlayer = game.getPlayerTurn();

		expect(currentTurnPlayer).toBeInstanceOf(Player);

		if (!currentTurnPlayer) {
			throw new Error("Current turn player is null");
		}

		const nonTurnPlayer = game.getAdversary(currentTurnPlayer);

		const result = game.play(nonTurnPlayer);

		expect(game.getHeap().length).toBe(0);
		expect(result.winner).toBe(currentTurnPlayer);
		expect(result.loser).toBe(nonTurnPlayer);
		expect(result.currentTurn).toBe(currentTurnPlayer);

		// currentTurnPlayer should be player 2
		expect(currentTurnPlayer.getCardCount()).toBeGreaterThan(
			nonTurnPlayer.getCardCount(),
		);
		expect(currentTurnPlayer.getCardCount()).toBe(29);
		expect(nonTurnPlayer.getCardCount()).toBe(23);
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

	test("players should be able to deck out without tapping", () => {
		game.startGame();

		const firstPlayer = game.getPlayerTurn();

		if (!firstPlayer) {
			throw new Error("Current turn player is null");
		}

		const secondPlayer = game.getAdversary(firstPlayer);

		for (let i = 0; i < 26; i++) {
			game.play(firstPlayer);
			game.play(secondPlayer);
		}

		expect(game.getHeap().length).toBe(52);
		expect(firstPlayer.getCardCount()).toBe(0);
		expect(secondPlayer.getCardCount()).toBe(0);

		const currentTurn = game.getPlayerTurn();
		expect(currentTurn).toBeNull();
	});
});

describe("Game endgame", () => {
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

	test("game should end when a player runs out of cards", () => {
		game.startGame();

		let currentTurn = 0;
		const MAX_ITERATIONS = 10000;

		while (currentTurn < MAX_ITERATIONS) {
			const playerTurn = game.getPlayerTurn();
			if (playerTurn === null) {
				break;
			}

			game.play(playerTurn);

			currentTurn++;
		}

		const winner = game.getWinner();
		expect(winner).toBe(null);
		expect(player1.getCardCount()).toBe(0);
		expect(player2.getCardCount()).toBe(0);
	});
});
