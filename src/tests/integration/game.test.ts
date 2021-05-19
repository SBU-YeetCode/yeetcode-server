import { ApolloServer, gql } from 'apollo-server-express'
import { createTestClient } from 'apollo-server-testing'
import { GraphQLSchema } from 'graphql'
import { Game, GameProgress, Level, Question, Stage, Roadmap, Comment } from '../../entities'
import { CommentMongooseModel } from '../../modules/comment/model'
import { PaginatedGameResponse, UpdateGame } from '../../modules/game/input'
import { GameMongooseModel } from '../../modules/game/model'
import { GameProgressMongooseModel } from '../../modules/gameProgress/model'
import { UserMongooseModel } from '../../modules/user/model'
import { Deleted } from '../../modules/utils/output'
import { buildSchema } from '../../utils'
import { createComment } from '../data/comment-builder'
import { createGame } from '../data/game-builder'
import { createGameProgress } from '../data/gameProgress-builder'
import { createLevel } from '../data/level-builder'
import { createQuestion } from '../data/question-builder'
import { createStage } from '../data/stage-builder'
import { createRoadmap } from '../data/subgameroadmap-builder'
import { createUser } from '../data/user-builder'
import { clearDatabase, closeDatabase, connect, populateDatabase } from '../utils'

// beforeEach(async () => {
// 	await populateDatabase(WcifMongooseModel, [wcif1])
// })

afterEach(async (done) => {
	await clearDatabase()
	done()
})

afterAll(async (done) => {
	await closeDatabase()
	done()
})

describe('Game', () => {
	let graphqlSchema: GraphQLSchema
	beforeAll(async (done) => {
		connect()
		graphqlSchema = await buildSchema()
		done()
	})

	it('should get games created by user in db', async () => {
		// Create User
		const user = createUser({})
		let games: Game[] = []
		for (let i = 0; i < 5; i++) {
			// Generate 5 games
			games.push(createGame({}))
		}
		// Set games from index 1 to have desired user id
		games[1].createdBy = user._id.toHexString()
		// Add this game is user's created games array
		// user.gamesCreated.push(games[1]._id.toHexString())
		// Send data to db
		await populateDatabase(GameMongooseModel, games)
		await populateDatabase(UserMongooseModel, [user])
		const server = new ApolloServer({ schema: graphqlSchema }) as any
		// use the test server to create a query function
		const { query } = createTestClient(server)
		const res = await query<{ getUserCreatedGames: Game[] }>({
			query: GET_USER_CREATED_GAMES,
			variables: { userId: user._id.toHexString() },
		})
		const { _id, questions, stages, levels, roadmap, ...gamesToMatch } = games[1]
		expect(res.data?.getUserCreatedGames.length).toEqual(1)
		expect(res.data?.getUserCreatedGames[0]).toEqual(gamesToMatch)
	})

	it('should get no games created by user in db', async () => {
		// Create User
		const user = createUser({})
		let games: Game[] = []
		for (let i = 0; i < 5; i++) {
			// Generate 5 games
			games.push(createGame({}))
		}
		// Send data to db
		await populateDatabase(GameMongooseModel, games)
		await populateDatabase(UserMongooseModel, [user])
		const server = new ApolloServer({ schema: graphqlSchema }) as any
		// use the test server to create a query function
		const { query } = createTestClient(server)
		const res = await query<{ getUserCreatedGames: Game[] }>({
			query: GET_USER_CREATED_GAMES,
			variables: { userId: user._id.toHexString() },
		})
		expect(res.data?.getUserCreatedGames.length).toEqual(0)
	})

	// it('should get game completed by user in db', async () => {
	// 	// Create User
	// 	const user = createUser({})
	// 	let games: Game[] = []
	// 	for (let i = 0; i < 5; i++) {
	// 		// Generate 5 games
	// 		games.push(createGame({}))
	// 	}
	// 	// Add this game to user's completed games array
	// 	// user.gamesCompleted.push(games[1]._id.toHexString())
	// 	// Send data to db
	// 	await populateDatabase(GameMongooseModel, games)
	// 	await populateDatabase(UserMongooseModel, [user])
	// 	const server = new ApolloServer({ schema: graphqlSchema }) as any
	// 	// use the test server to create a query function
	// 	const { query } = createTestClient(server)
	// 	const res = await query<{ getUserCompletedGames: Game[] }>({
	// 		query: GET_USER_COMPLETED_GAMES,
	// 		variables: { userId: user._id.toHexString() },
	// 	})
	// 	const {
	// 		_id,
	// 		questions,
	// 		stages,
	// 		levels,
	// 		roadmap,
	// 		...gameToMatch
	// 	} = games[1]
	// 	expect(res.data?.getUserCompletedGames.length).toEqual(1)
	// 	expect(res.data?.getUserCompletedGames[0]).toEqual(gameToMatch)
	// })

	// it('should get no games completed by user in db', async () => {
	// 	// Create User
	// 	const user = createUser({})
	// 	let games: Game[] = []
	// 	for (let i = 0; i < 5; i++) {
	// 		// Generate 5 games
	// 		games.push(createGame({}))
	// 	}
	// 	// Send data to db
	// 	await populateDatabase(GameMongooseModel, games)
	// 	await populateDatabase(UserMongooseModel, [user])
	// 	const server = new ApolloServer({ schema: graphqlSchema }) as any
	// 	// use the test server to create a query function
	// 	const { query } = createTestClient(server)
	// 	const res = await query<{ getUserCompletedGames: Game[] }>({
	// 		query: GET_USER_COMPLETED_GAMES,
	// 		variables: { userId: user._id.toHexString() },
	// 	})
	// 	expect(res.data?.getUserCompletedGames.length).toEqual(0)
	// })

	// it('should get games played by user in db', async () => {
	// 	// Create User
	// 	const user = createUser({})
	// 	let games: Game[] = []
	// 	for (let i = 0; i < 5; i++) {
	// 		// Generate 5 games
	// 		games.push(createGame({}))
	// 	}
	// 	// Add game[1] to user's played games array
	// 	// user.gamesRecent.push(games[1]._id.toHexString())
	// 	// Send data to db
	// 	await populateDatabase(GameMongooseModel, games)
	// 	await populateDatabase(UserMongooseModel, [user])
	// 	const server = new ApolloServer({ schema: graphqlSchema }) as any
	// 	// use the test server to create a query function
	// 	const { query } = createTestClient(server)
	// 	const res = await query<{ getUserRecentGames: Game[] }>({
	// 		query: GET_USER_RECENT_GAMES,
	// 		variables: { userId: user._id.toHexString() },
	// 	})
	// 	const {
	// 		_id,
	// 		questions,
	// 		stages,
	// 		levels,
	// 		roadmap,
	// 		...gameToMatch
	// 	} = games[1]
	// 	expect(res.data?.getUserRecentGames.length).toEqual(1)
	// 	expect(res.data?.getUserRecentGames[0]).toEqual(gameToMatch)
	// })

	// it('should get no games played by user in db', async () => {
	// 	// Create User
	// 	const user = createUser({})
	// 	let games: Game[] = []
	// 	for (let i = 0; i < 5; i++) {
	// 		// Generate 5 games
	// 		games.push(createGame({}))
	// 	}
	// 	// Send data to db
	// 	await populateDatabase(GameMongooseModel, games)
	// 	await populateDatabase(UserMongooseModel, [user])
	// 	const server = new ApolloServer({ schema: graphqlSchema }) as any
	// 	// use the test server to create a query function
	// 	const { query } = createTestClient(server)
	// 	const res = await query<{ getUserRecentGames: Game[] }>({
	// 		query: GET_USER_RECENT_GAMES,
	// 		variables: { userId: user._id.toHexString() },
	// 	})
	// 	expect(res.data?.getUserRecentGames.length).toEqual(0)
	// })

	it('gets paginated filtered game results', async () => {
		const games: Game[] = []
		for (let i = 0; i < 15; i++) {
			games.push(
				createGame({
					codingLanguage: i < 10 ? 'JAVASCRIPT' : 'C',
					rating: i,
				})
			)
		}
		await populateDatabase(GameMongooseModel, games)
		const server = new ApolloServer({ schema: graphqlSchema }) as any
		// use the test server to create a query function
		const { query } = createTestClient(server)
		const res = await query<{ getFilterGames: PaginatedGameResponse }>({
			query: GET_FILTER_GAMES,
			variables: {
				sort: 'RATING',
				sortDir: -1,
				amount: 9,
				language: 'JAVASCRIPT',
			},
		})
		const expected = games
			.filter((g) => g.codingLanguage === 'JAVASCRIPT')
			.sort(
				(a: Game, b: Game) =>
					b.rating - a.rating || parseInt(b._id.toHexString()) - parseInt(b._id.toHexString())
			)
			.map((g) => {
				const { _id, questions, stages, levels, roadmap, ...gameToMatch } = g
				return { ...gameToMatch, _id: _id.toHexString() }
			})
		expect(res?.data?.getFilterGames.nodes).toEqual(expected.slice(0, expected.length - 1))
		expect(res?.data?.getFilterGames.hasMore).toBeTruthy()
		expect(res?.data?.getFilterGames.nextCursor).toEqual(expected[expected.length - 2]._id)
	})

	it('gets paginated search results', async () => {
		let matchingGames: Game[] = []
		let otherGames: Game[] = []
		matchingGames.push(
			createGame({
				codingLanguage: 'javascript',
				title: 'Saransh Grover Cubing',
			})
		)
		matchingGames.push(createGame({ description: 'saransh grover' }))
		matchingGames.push(createGame({ tags: ['javascript'] }))
		for (let i = 0; i < 15; i++) {
			otherGames.push(createGame({}))
		}
		await populateDatabase(GameMongooseModel, [...matchingGames, ...otherGames])
		const server = new ApolloServer({ schema: graphqlSchema }) as any
		const { query } = createTestClient(server)
		const res = await query<{ getSearch: PaginatedGameResponse }>({
			query: GET_SEARCH,
			variables: { query: 'Saransh javascript', amount: 10 },
		})
		const nodes = res?.data?.getSearch.nodes
		for (const node of nodes || []) {
			const gameId = matchingGames.find((g) => g._id.toHexString() === (node._id as any))?._id.toHexString()
			expect(gameId).toEqual(node._id)
		}
		expect(res?.data?.getSearch.hasMore).toBeFalsy()
		expect(res?.data?.getSearch.nextCursor).toBeNull()
	})
	it('should get a level in db', async () => {
		// Create Game
		let games: Game[] = []
		games.push(createGame({}))
		const game = games[0]
		for (let i = 0; i < 3; i++) {
			// Generate 3 levels
			game.levels.push(createLevel({}))
		}
		// Get the id of second level in the game
		const levelIdToCheck = game.levels[1]._id.toHexString()
		// Send data to db
		await populateDatabase(GameMongooseModel, games)
		const server = new ApolloServer({ schema: graphqlSchema }) as any
		// use the test server to create a query function
		const { query } = createTestClient(server)
		const res = await query<{ getLevel: Level }>({
			query: GET_LEVEL,
			variables: {
				levelId: levelIdToCheck,
				gameId: game._id.toHexString(),
			},
		})
		expect(res.data?.getLevel._id).toEqual(levelIdToCheck)
	})

	it('should get a stage in db', async () => {
		// Create Game
		let games: Game[] = []
		games.push(createGame({}))
		const game = games[0]
		for (let i = 0; i < 3; i++) {
			// Generate 3 stages
			game.stages.push(createStage({}))
		}
		// Get the id of second stage in the game
		const stageIdToCheck = game.stages[1]._id.toHexString()
		// Send data to db
		await populateDatabase(GameMongooseModel, games)
		const server = new ApolloServer({ schema: graphqlSchema }) as any
		// use the test server to create a query function
		const { query } = createTestClient(server)
		const res = await query<{ getStage: Stage }>({
			query: GET_STAGE,
			variables: {
				stageId: stageIdToCheck,
				gameId: game._id.toHexString(),
			},
		})
		expect(res.data?.getStage._id).toEqual(stageIdToCheck)
	})

	it('should get a question in db', async () => {
		// Create Game
		let games: Game[] = []
		games.push(createGame({}))
		const game = games[0]
		for (let i = 0; i < 3; i++) {
			// Generate 3 questions
			game.questions.push(createQuestion({}))
		}
		// Get the id of second question in the game
		const questionIdToCheck = game.questions[1]._id.toHexString()
		// Send data to db
		await populateDatabase(GameMongooseModel, games)
		const server = new ApolloServer({ schema: graphqlSchema }) as any
		// use the test server to create a query function
		const { query } = createTestClient(server)
		const res = await query<{ getQuestion: Question }>({
			query: GET_QUESTION,
			variables: {
				questionId: questionIdToCheck,
				gameId: game._id.toHexString(),
			},
		})
		expect(res.data?.getQuestion._id).toEqual(questionIdToCheck)
	})

	it('should get a roadmap in db', async () => {
		// Create Game
		let games: Game[] = []
		games.push(createGame({}))
		const game = games[0]
		for (let i = 0; i < 3; i++) {
			// Generate roadmap
			game.roadmap.push(createRoadmap({}))
		}
		// Get the id of roadmap in the game
		const roadmapIdToCheck = game.roadmap[0]._id.toHexString()
		// Send data to db
		await populateDatabase(GameMongooseModel, games)
		const server = new ApolloServer({ schema: graphqlSchema }) as any
		// use the test server to create a query function
		const { query } = createTestClient(server)
		const res = await query<{ getRoadmap: Roadmap[] }>({
			query: GET_ROADMAP,
			variables: { gameId: game._id.toHexString() },
		})
		expect(res.data?.getRoadmap.length).toEqual(3)
		expect(res.data?.getRoadmap[0]._id).toEqual(roadmapIdToCheck)
	})

	it('should update a level in db', async () => {
		// Create Game
		let games: Game[] = []
		games.push(createGame({}))
		const game = games[0]
		for (let i = 0; i < 3; i++) {
			// Generate 3 levels
			game.levels.push(createLevel({}))
		}
		// Get the second level in the game and update it
		const levelsToUpdate = [game.levels[1]]
		levelsToUpdate[0].description = 'updated description'
		// Send data to db
		await populateDatabase(GameMongooseModel, games)
		const server = new ApolloServer({ schema: graphqlSchema }) as any
		// use the test server to create a query function
		const { mutate } = createTestClient(server)
		const res = await mutate<{ updateLevels: Level[] }>({
			mutation: UPDATE_LEVELS,
			variables: {
				levelsToUpdate: levelsToUpdate,
				gameId: game._id.toHexString(),
			},
		})
		expect(res.data?.updateLevels[1].description).toEqual(levelsToUpdate[0].description)
	})

	it('should update a question in db', async () => {
		// Create Game
		let games: Game[] = []
		games.push(createGame({}))
		const game = games[0]
		for (let i = 0; i < 3; i++) {
			// Generate 3 questions
			game.questions.push(createQuestion({}))
		}
		// Get the second question in the game and update it
		const questionsToUpdate = [game.questions[1]]
		questionsToUpdate[0].description = 'updated description'
		// Send data to db
		await populateDatabase(GameMongooseModel, games)
		const server = new ApolloServer({ schema: graphqlSchema }) as any
		// use the test server to create a query function
		const { mutate } = createTestClient(server)
		const res = await mutate<{ updateQuestions: Question[] }>({
			mutation: UPDATE_QUESTIONS,
			variables: {
				questionsToUpdate: questionsToUpdate,
				gameId: game._id.toHexString(),
			},
		})
		expect(res.data?.updateQuestions[1].description).toEqual(questionsToUpdate[0].description)
	})

	it('should update a stage in db', async () => {
		// Create Game
		let games: Game[] = []
		games.push(createGame({}))
		const game = games[0]
		for (let i = 0; i < 3; i++) {
			// Generate 3 stages
			game.stages.push(createStage({}))
		}
		// Get the second stage in the game and update it
		const stagesToUpdate = [game.stages[1]]
		stagesToUpdate[0].description = 'updated description'
		// Send data to db
		await populateDatabase(GameMongooseModel, games)
		const server = new ApolloServer({ schema: graphqlSchema }) as any
		// use the test server to create a query function
		const { mutate } = createTestClient(server)
		const res = await mutate<{ updateStages: Stage[] }>({
			mutation: UPDATE_STAGES,
			variables: {
				stagesToUpdate: stagesToUpdate,
				gameId: game._id.toHexString(),
			},
		})
		expect(res.data?.updateStages[1].description).toEqual(stagesToUpdate[0].description)
	})

	it('should delete game in db', async () => {
		// Create user
		const user = createUser({})
		const server = new ApolloServer({
			schema: graphqlSchema,
			context: { req: { user } },
		}) as any
		// Create 3 games
		const games: Game[] = []
		for (var i = 0; i < 3; i++) games.push(createGame({}))
		// 1 game owned by user
		games[0].createdBy = user._id.toHexString()
		// Create 6 comments
		const comments: Comment[] = []
		for (var i = 0; i < 6; i++) comments.push(createComment({}))
		// 2 comments on game
		comments[2].gameId = games[0]._id.toHexString()
		comments[3].gameId = games[0]._id.toHexString()
		// Create 4 game progresses
		const gameProgresses: GameProgress[] = []
		for (var i = 0; i < 4; i++) gameProgresses.push(createGameProgress({}))
		// 2 games progresses on game
		gameProgresses[0].gameId = games[0]._id.toHexString()
		gameProgresses[1].gameId = games[0]._id.toHexString()
		await populateDatabase(UserMongooseModel, [user])
		await populateDatabase(GameMongooseModel, games)
		await populateDatabase(CommentMongooseModel, comments)
		await populateDatabase(GameProgressMongooseModel, gameProgresses)
		const { mutate } = createTestClient(server)
		const res = await mutate<{ deleteGame: Deleted }>({
			mutation: DELETE_GAME,
			variables: { userId: user._id, gameId: games[0]._id.toHexString() },
		})
		expect(res.data?.deleteGame.amountDeleted).toEqual(5)
		expect(res.data?.deleteGame.success).toEqual(true)
	})

	it('should update game in db', async () => {
		const graphqlSchema = await buildSchema()
		// Create game
		let games: Game[] = []
		games.push(createGame({}))
		// Get the game and edit the title
		const game = games[0]
		await populateDatabase(GameMongooseModel, games)
		const server = new ApolloServer({ schema: graphqlSchema }) as any
		const newGameInfo: Required<UpdateGame> = {
			gameId: game._id,
			newCodingLanguage: 'python',
			newTitle: 'new game title',
			newDifficulty: game.difficulty,
			newTags: game.tags,
			newDescription: 'new desc',
			newBanner: '',
		}
		game.codingLanguage = newGameInfo.newCodingLanguage
		game.title = newGameInfo.newTitle
		game.dateCreated = newGameInfo.newDescription
		const { mutate } = createTestClient(server)
		const res = await mutate<{ updateGame: Game }>({
			mutation: UPDATE_GAME,
			variables: { ...newGameInfo },
		})
		expect(res.data?.updateGame.codingLanguage).toEqual(newGameInfo.newCodingLanguage)
		expect(res.data?.updateGame.title).toEqual(newGameInfo.newTitle)
		expect(res.data?.updateGame.description).toEqual(newGameInfo.newDescription)
	})
})

const DELETE_GAME = gql`
	mutation deleteGame($userId: ObjectId!, $gameId: String!) {
		deleteGame(userId: $userId, gameId: $gameId) {
			success
			amountDeleted
			err
		}
	}
`

const GET_USER_RECENT_GAMES = gql`
	query getUserRecentGames($userId: String!) {
		getUserRecentGames(userId: $userId) {
			createdBy
			dateCreated
			lastUpdated
			commentCount
			totalStars
			playCount
			rating
			commentsRef
			title
			codingLanguage
			difficulty
			tags
			description
		}
	}
`

const GET_USER_COMPLETED_GAMES = gql`
	query getUserCompletedGames($userId: String!) {
		getUserCompletedGames(userId: $userId) {
			createdBy
			bannerUrl
			dateCreated
			lastUpdated
			commentCount
			totalStars
			playCount
			rating
			commentsRef
			title
			codingLanguage
			difficulty
			tags
			description
		}
	}
`

const GET_USER_CREATED_GAMES = gql`
	query getUserCreatedGames($userId: String!) {
		getUserCreatedGames(userId: $userId) {
			createdBy
			bannerUrl
			dateCreated
			lastUpdated
			commentCount
			totalStars
			playCount
			rating
			commentsRef
			title
			codingLanguage
			difficulty
			tags
			description
		}
	}
`

const GET_FILTER_GAMES = gql`
	query getFilterGames($sort: SORT_OPTIONS, $sortDir: Int, $amount: Int, $language: LANGUAGES, $cursor: String) {
		getFilterGames(sort: $sort, sortDir: $sortDir, amount: $amount, language: $language, cursor: $cursor) {
			nodes {
				_id
				bannerUrl
				createdBy
				dateCreated
				lastUpdated
				commentCount
				totalStars
				playCount
				rating
				commentsRef
				title
				codingLanguage
				difficulty
				tags
				description
			}
			hasMore
			nextCursor
		}
	}
`

const GET_SEARCH = gql`
	query getSearch($cursor: String, $query: String!, $amount: Int) {
		getSearch(cursor: $cursor, query: $query, amount: $amount) {
			nodes {
				_id
				title
				tags
			}
			hasMore
			nextCursor
		}
	}
`

const GET_LEVEL = gql`
	query getLevel($levelId: String!, $gameId: String!) {
		getLevel(levelId: $levelId, gameId: $gameId) {
			_id
			title
			description
		}
	}
`

const GET_STAGE = gql`
	query getStage($stageId: String!, $gameId: String!) {
		getStage(stageId: $stageId, gameId: $gameId) {
			_id
			title
			description
		}
	}
`

const GET_QUESTION = gql`
	query getQuestion($questionId: String!, $gameId: String!) {
		getQuestion(questionId: $questionId, gameId: $gameId) {
			_id
			title
			description
			timeLimit
			points
			lives
			hints {
				_id
				description
				timeToReveal
			}
			gameType
			multipleChoice {
				prompt
				correctChoice
				incorrectChoices
			}
			fillInTheBlank {
				prompt
				solutions
			}
			spotTheBug {
				prompt
				bugLine
				code
			}
			liveCoding {
				prompt
				exampleSolutionCode
				exampleSolutionDescription
			}
			matching {
				prompt
				matching {
					pairOne
					pairTwo
				}
			}
		}
	}
`

const GET_ROADMAP = gql`
	query getRoadmap($gameId: String!) {
		getRoadmap(gameId: $gameId) {
			_id
			parent
			sequence
			kind
		}
	}
`

const UPDATE_LEVELS = gql`
	mutation updateLevels($levelsToUpdate: [Level!]!, $gameId: String!) {
		updateLevels(levelsToUpdate: $levelsToUpdate, gameId: $gameId) {
			_id
			title
			description
		}
	}
`

const UPDATE_QUESTIONS = gql`
	mutation updateQuestions($questionsToUpdate: [Question!]!, $gameId: String!) {
		updateQuestions(questionsToUpdate: $questionsToUpdate, gameId: $gameId) {
			_id
			title
			description
			timeLimit
			points
			lives
			hints {
				_id
				description
				timeToReveal
			}
			gameType
			multipleChoice {
				prompt
				correctChoice
				incorrectChoices
			}
			fillInTheBlank {
				prompt
				solutions
			}
			spotTheBug {
				prompt
				bugLine
				code
			}
			liveCoding {
				prompt
				exampleSolutionCode
				exampleSolutionDescription
			}
			matching {
				prompt
				matching {
					pairOne
					pairTwo
				}
			}
		}
	}
`

const UPDATE_STAGES = gql`
	mutation updateStages($stagesToUpdate: [Stage!]!, $gameId: String!) {
		updateStages(stagesToUpdate: $stagesToUpdate, gameId: $gameId) {
			_id
			title
			description
		}
	}
`

const UPDATE_GAME = gql`
	mutation updateGame(
		$gameId: ObjectId!
		$newCodingLanguage: String!
		$newTitle: String!
		$newDifficulty: String!
		$newTags: [String!]!
		$newDescription: String!
	) {
		updateGame(
			gameId: $gameId
			newCodingLanguage: $newCodingLanguage
			newTitle: $newTitle
			newDifficulty: $newDifficulty
			newTags: $newTags
			newDescription: $newDescription
		) {
			_id
			codingLanguage
			title
			difficulty
			tags
			description
		}
	}
`
