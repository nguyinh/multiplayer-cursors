import { Cards as CardsEntity, type Player } from "@/entities";
import type { Cards } from "@/types";
import { logger } from "@/services/logger";

export class CardBattle {
	private players: Player[];
	private currentTurn: Player | null = null;
	private heap: Cards = [];
	private winner: Player | null;

	constructor() {
		this.players = [];
		this.winner = null;
	}

	public addPlayer(player: Player) {
		const playerInfo = player.get();
		if (this.players.length >= 2) {
			logger.warn(
				`Cannot add player ${playerInfo.username}: maximum players reached.`,
			);
		}

		const existingPlayer = this.players.find(
			(p) => p.get().socketId === playerInfo.socketId,
		);

		if (existingPlayer) {
			logger.warn(
				`Player with socket ID ${playerInfo.socketId} already exists.`,
			);
			return;
		}

		const hasNameConflict = this.players.find(
			(p) => p.get().username === playerInfo.username,
		);

		if (hasNameConflict) {
			logger.warn(
				`Player with username ${playerInfo.username} already exists.`,
			);
			return;
		}

		if (player) this.players.push(player);

		logger.debug(`👋 Player ${playerInfo.username} added successfully.`);
	}

	public getPlayerById(socketId: Player["socketId"]): Player | null {
		const player = this.players.find((p) => p.get().socketId === socketId);

		return player || null;
	}

	public startGame(): CardBattle | null {
		if (this.players.length < 2) {
			logger.warn("Not enough players to start the game.");
			return null;
		}

		const shuffledDeck = CardsEntity.shuffle(
			CardsEntity.generateFullDeck(),
		);
		const [deck1, deck2] = CardsEntity.distribute(shuffledDeck);

		this.players[0].giveCards(deck1);
		this.players[1].giveCards(deck2);

		// TODO: Shuffle starting player
		this.currentTurn = this.players[0];

		logger.debug("🎮 Game started");

		return this;
	}

	private nextTurn() {
		if (!this.currentTurn) {
			logger.error("Current turn is not set.");
			return;
		}

		const adversary = this.getAdversary(this.currentTurn);

		if (adversary.hasCards()) {
			this.currentTurn = adversary;
		} else if (this.currentTurn.hasCards()) {
			this.currentTurn = this.currentTurn;
		} else {
			this.currentTurn = null;
		}
	}

	public getPlayers(): Player[] {
		return this.players;
	}

	public play(player: Player): {
		winner: Player | null;
		loser: Player | null;
		currentTurn: Player | null;
	} {
		// Check if it is player turn
		if (player !== this.currentTurn) {
			logger.warn(`It's not ${player.get().username}'s turn.`);
			const adversary = this.getAdversary(player);
			adversary.giveCards(this.heap);
			this.heap = [];
			this.currentTurn = adversary;

			return {
				winner: adversary,
				loser: player,
				currentTurn: this.currentTurn,
			};
		}

		const playedCard = player.playCard();

		logger.debug(`🃏 ${player.get().username} played [${playedCard}]`);

		if (playedCard) {
			this.heap.push(playedCard);
		} else {
			logger.warn(`${player.get().username} has no cards to play.`);
			return {
				winner: null,
				loser: null,
				currentTurn: this.currentTurn,
			};
		}

		// Determine game equality
		if (this.heap.length === 52 && this.heap.at(-1) !== this.heap.at(-2)) {
			logger.debug(
				"🔄 Maximum turns reached without a winner. Game is a draw.",
			);
			this.currentTurn = null;

			return {
				winner: null,
				loser: null,
				currentTurn: this.currentTurn,
			};
		}

		this.nextTurn();

		return {
			winner: null,
			loser: null,
			currentTurn: this.currentTurn,
		};
	}

	public tapHeap(player: Player): {
		winner: Player | null;
		loser: Player | null;
		currentTurn: Player | null;
	} {
		logger.debug(`👏 ${player.get().username} tapped the heap.`);

		if (this.heap.length === 0) {
			logger.warn("Heap is empty, cannot tap.");
			return {
				winner: null,
				loser: null,
				currentTurn: this.currentTurn,
			};
		}

		const notEnoughCardsInHeap = this.heap.length < 2;

		const cardsMismatch =
			this.heap.length > 2 &&
			this.heap[this.heap.length - 1] !== this.heap[this.heap.length - 2];

		const isWrongTap = notEnoughCardsInHeap || cardsMismatch;

		const adversary = this.getAdversary(player);

		if (isWrongTap) {
			logger.debug(
				`❌ ${player.get().username} tapped the heap incorrectly.`,
			);

			if (adversary) {
				adversary.giveCards(this.heap);
			}
			this.heap = [];
			this.currentTurn = adversary;

			return {
				winner: adversary,
				loser: player,
				currentTurn: this.currentTurn,
			};
		}

		logger.debug(`✅ ${player.get().username} won this round.`);

		player.giveCards(this.heap);
		this.heap = [];

		// Check if game is over
		if (!player.hasCards()) {
			this.setWinner(adversary);
			this.currentTurn = null;
			logger.debug(`🏆 ${adversary.get().username} has won the game!`);
			return {
				winner: adversary,
				loser: player,
				currentTurn: this.currentTurn,
			};
		} else if (adversary && !adversary.hasCards()) {
			this.setWinner(player);
			this.currentTurn = null;
			logger.debug(`🏆 ${player.get().username} has won the game!`);
			return {
				winner: player,
				loser: adversary,
				currentTurn: this.currentTurn,
			};
		} else {
			this.currentTurn = player;
			return {
				winner: player,
				loser: adversary,
				currentTurn: this.currentTurn,
			};
		}
	}

	public getAdversary(player: Player): Player {
		const adversary = this.players.find((p) => p !== player);
		if (!adversary) {
			throw new Error("Adversary not found");
		}
		return adversary;
	}

	public getHeap() {
		return this.heap;
	}

	private setWinner(player: Player) {
		this.winner = player;
	}

	getPlayerTurn(): Player | null {
		return this.currentTurn;
	}

	public getWinner(): Player | null {
		return this.winner;
	}
}
