"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const store_1 = require("../src/models/store");
const GameEngine_1 = require("../src/services/GameEngine");
const SeedData_1 = require("../src/services/SeedData");
async function runTests() {
    console.log('--- STARTING GAME ENGINE TESTS ---');
    let passed = 0;
    let failed = 0;
    function assert(condition, testName) {
        if (condition) {
            console.log(`✅ PASS: ${testName}`);
            passed++;
        }
        else {
            console.error(`❌ FAIL: ${testName}`);
            failed++;
        }
    }
    // 1. Seed initial questions
    for (const q of SeedData_1.SEED_QUESTIONS) {
        await store_1.store.saveQuestion(q);
    }
    const allQ = await store_1.store.getAllQuestions();
    assert(allQ.length >= 3, 'Seed questions populated');
    // 2. Create room
    const testRoomCode = 'TEST01';
    await store_1.store.createRoom({
        id: 'room-1',
        roomCode: testRoomCode,
        eventName: 'Inter-College Tech Fest',
        roundName: 'Round 1',
        status: 'waiting',
        settings: {
            eventName: 'Inter-College Tech Fest',
            roundName: 'Round 1',
            maxParticipants: 50,
            timePerQuestion: 30,
            pointsPerDifference: 10,
            negativeMarking: 2,
            fastestAnswerBonus: 5,
            showLeaderboardDuringGame: true,
            showCorrectAnswersAfterQuestion: true,
            allowLateJoin: false,
            soundEffects: true
        },
        questionIds: [allQ[0].id],
        currentQuestionIndex: 0,
        createdBy: 'admin',
        createdAt: new Date().toISOString()
    });
    const room = await store_1.store.getRoom(testRoomCode);
    assert(room !== undefined && room.roomCode === testRoomCode, 'Room created and retrieved');
    // 3. Add Participants
    const session1 = 'session_arun_123';
    const session2 = 'session_priya_456';
    await store_1.store.addParticipant({
        id: 'p1',
        roomId: 'room-1',
        roomCode: testRoomCode,
        name: 'Arun Kumar',
        participantId: '21CS01',
        sessionId: session1,
        status: 'connected',
        score: 0,
        correctAnswers: 0,
        wrongAnswers: 0,
        differencesFound: {},
        totalTime: 0,
        lastActiveTimestamp: Date.now(),
        joinedAt: new Date().toISOString()
    });
    await store_1.store.addParticipant({
        id: 'p2',
        roomId: 'room-1',
        roomCode: testRoomCode,
        name: 'Priya Sharma',
        participantId: '21CS02',
        sessionId: session2,
        status: 'connected',
        score: 0,
        correctAnswers: 0,
        wrongAnswers: 0,
        differencesFound: {},
        totalTime: 0,
        lastActiveTimestamp: Date.now(),
        joinedAt: new Date().toISOString()
    });
    const participants = await store_1.store.getParticipantsByRoom(testRoomCode);
    assert(participants.length === 2, '2 Participants joined room');
    // 4. Start Game
    const engine = GameEngine_1.GameEngine.getInstance();
    await engine.startGame(testRoomCode);
    // 5. Answer Validation: Correct Tap (Apple on Tree at ~21%, 47%)
    const correctResult = await engine.handleAnswerSubmission({
        roomCode: testRoomCode,
        sessionId: session1,
        questionId: allQ[0].id,
        x: 21.2,
        y: 47.5,
        clientTimestamp: Date.now()
    });
    assert(correctResult.correct === true, 'Correct difference hit detected');
    assert(correctResult.scoreGained >= 10, 'Score gained for correct answer');
    // 6. Duplicate Tap Prevention: Arun taps the same apple again
    const duplicateResult = await engine.handleAnswerSubmission({
        roomCode: testRoomCode,
        sessionId: session1,
        questionId: allQ[0].id,
        x: 21.2,
        y: 47.5,
        clientTimestamp: Date.now()
    });
    assert(duplicateResult.correct === false, 'Duplicate spot submission prevented');
    // 7. Wrong Tap Validation & Negative Marking: Priya taps empty sky (x: 5, y: 5)
    const wrongResult = await engine.handleAnswerSubmission({
        roomCode: testRoomCode,
        sessionId: session2,
        questionId: allQ[0].id,
        x: 5,
        y: 5,
        clientTimestamp: Date.now()
    });
    assert(wrongResult.correct === false, 'Wrong tap identified correctly');
    assert(wrongResult.scoreGained === -2, 'Negative marking correctly deducted -2 points');
    // 8. Reconnection State Recovery
    const recoveredState = await engine.getParticipantGameState(session1);
    assert(recoveredState !== null, 'Participant state recovered on reconnection');
    assert(recoveredState?.gameState.roomCode === testRoomCode, 'Recovered room code matches');
    assert(recoveredState?.gameState.foundDifferenceIds?.length === 1, 'Recovered found differences list intact');
    // 9. Winner Calculation & Tie Breakers
    const winnerSummary = await engine.endGame(testRoomCode);
    assert(winnerSummary !== null, 'Winner calculated');
    assert(winnerSummary?.winner.name === 'Arun Kumar', 'Arun Kumar ranked #1 Champion with highest score');
    console.log(`\n================================`);
    console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log(`================================`);
    if (failed > 0)
        process.exit(1);
}
runTests().catch(err => {
    console.error('Test execution error:', err);
    process.exit(1);
});
