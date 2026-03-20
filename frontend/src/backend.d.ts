import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface QuestionResultsResponse {
    questionIndex: bigint;
    questionText: string;
    questionType: QuestionType;
    answerDistribution: Array<AnswerDistribution>;
    correctCount: bigint;
    options: Array<string>;
    totalAnswers: bigint;
}
export interface LeaderboardEntry {
    displayName: string;
    playerId: bigint;
    rank: bigint;
    score: bigint;
    currentStreak: bigint;
    avatarIndex: bigint;
}
export interface QuestionSummary {
    questionIndex: bigint;
    questionText: string;
    questionType: QuestionType;
    answerDistribution: Array<AnswerDistribution>;
    correctCount: bigint;
    correctPercent: bigint;
    options: Array<string>;
    totalAnswers: bigint;
}
export interface PostGameSummaryResponse {
    questionSummaries: Array<QuestionSummary>;
    totalPlayers: bigint;
    totalQuestions: bigint;
}
export interface Quiz {
    id: bigint;
    title: string;
    createdAt: bigint;
    updatedAt: bigint;
    questions: Array<Question>;
}
export interface Report {
    id: bigint;
    playedAt: bigint;
    playerCount: bigint;
    summary: PostGameSummaryResponse;
    players: Array<ArchivedPlayer>;
    questions: Array<ArchivedQuestion>;
    quizTitle: string;
    questionCount: bigint;
}
export interface Profile {
    name: string;
}
export interface AnswerDistribution {
    count: bigint;
    optionIndex: bigint;
    isCorrect: boolean;
}
export interface SessionInfo {
    roomPin: string;
    sessionId: bigint;
}
export interface ArchivedPlayer {
    displayName: string;
    answers: Array<ArchivedPlayerAnswer>;
    rank: bigint;
    score: bigint;
    avatarIndex: bigint;
}
export interface JoinResult {
    playerToken: bigint;
    playerId: bigint;
    sessionId: bigint;
    avatarIndex: bigint;
}
export interface LeaderboardResponse {
    totalPlayers: bigint;
    entries: Array<LeaderboardEntry>;
}
export interface ArchivedPlayerAnswer {
    selectedOptions: Array<bigint>;
    isCorrect: boolean;
    questionIndex: bigint;
    pointsEarned: bigint;
    sliderValue: bigint;
    textAnswer: string;
}
export type AnswerSubmission = {
    __kind__: "text";
    text: string;
} | {
    __kind__: "slider";
    slider: bigint;
} | {
    __kind__: "options";
    options: Array<bigint>;
};
export interface StreakEntry {
    streak: bigint;
    displayName: string;
    avatarIndex: bigint;
}
export interface SessionStateResponse {
    status: SessionStatus;
    currentPhase: GamePhase;
    roomPin: string;
    playerCount: bigint;
    players: Array<PublicPlayerData>;
    answerCount: bigint;
    isLocked: boolean;
    sessionId: bigint;
    phaseStartTime: bigint;
    autoAdvance: boolean;
    currentQuestionIndex: bigint;
    currentQuestion?: HostQuestionData;
    questionCount: bigint;
}
export interface PublicPlayerData {
    displayName: string;
    playerId: bigint;
    score: bigint;
    avatarIndex: bigint;
}
export interface ArchivedQuestion {
    text: string;
    sliderMax: bigint;
    sliderMin: bigint;
    questionType: QuestionType;
    acceptedAnswers: Array<string>;
    options: Array<string>;
    sliderCorrect: bigint;
    correctOptionIndices: Array<bigint>;
}
export interface ReportSummary {
    id: bigint;
    playedAt: bigint;
    playerCount: bigint;
    quizTitle: string;
    questionCount: bigint;
}
export interface HostQuestionData {
    theme: string;
    pointMode: PointMode;
    timeLimit: bigint;
    text: string;
    sliderMax: bigint;
    sliderMin: bigint;
    questionType: QuestionType;
    image?: ExternalBlob;
    showQuestionToPlayers: boolean;
    acceptedAnswers: Array<string>;
    options: Array<string>;
    sliderCorrect: bigint;
    correctOptionIndices: Array<bigint>;
    imagePlacement: ImagePlacement;
}
export interface PlayerQuestionData {
    theme: string;
    timeLimit: bigint;
    text: string;
    sliderMax: bigint;
    sliderMin: bigint;
    questionType: QuestionType;
    image?: ExternalBlob;
    showQuestionToPlayers: boolean;
    options: Array<string>;
    imagePlacement: ImagePlacement;
}
export interface PlayerStateResponse {
    status: SessionStatus;
    currentPhase: GamePhase;
    ownScore: bigint;
    ownDisplayName: string;
    lastHostHeartbeat: bigint;
    playerCount: bigint;
    players: Array<PublicPlayerData>;
    hasAnsweredCurrent: boolean;
    isLocked: boolean;
    lastPointsEarned: bigint;
    phaseStartTime: bigint;
    ownAvatarIndex: bigint;
    currentQuestionIndex: bigint;
    currentStreak: bigint;
    currentQuestion?: PlayerQuestionData;
    lastAnswerCorrect?: boolean;
}
export interface Question {
    theme: string;
    pointMode: PointMode;
    timeLimit: bigint;
    text: string;
    isMultiSelect: boolean;
    sliderMax: bigint;
    sliderMin: bigint;
    questionType: QuestionType;
    image?: ExternalBlob;
    showQuestionToPlayers: boolean;
    acceptedAnswers: Array<string>;
    options: Array<string>;
    sliderCorrect: bigint;
    correctOptionIndices: Array<bigint>;
    imagePlacement: ImagePlacement;
}
export enum GamePhase {
    answering = "answering",
    scoreboard = "scoreboard",
    results = "results",
    ended = "ended",
    lobby = "lobby",
    questionDisplay = "questionDisplay",
    podium = "podium"
}
export enum ImagePlacement {
    background = "background",
    centered = "centered"
}
export enum PointMode {
    double_ = "double",
    none = "none",
    standard = "standard"
}
export enum QuestionType {
    quiz = "quiz",
    slider = "slider",
    typeAnswer = "typeAnswer",
    trueFalse = "trueFalse"
}
export enum SessionStatus {
    active = "active",
    ended = "ended",
    lobby = "lobby"
}
export interface backendInterface {
    advancePhase(sessionId: bigint): Promise<void>;
    checkRoomPin(roomPin: string): Promise<boolean>;
    createQuiz(title: string, questions: Array<Question>): Promise<bigint>;
    createSession(quizId: bigint): Promise<SessionInfo>;
    deleteQuiz(quizId: bigint): Promise<void>;
    deleteReport(reportId: bigint): Promise<void>;
    endSession(sessionId: bigint): Promise<void>;
    getLeaderboard(sessionId: bigint): Promise<LeaderboardResponse>;
    getPlayerLeaderboard(roomPin: string, playerToken: bigint): Promise<LeaderboardResponse>;
    getPlayerQuestionResults(roomPin: string, playerToken: bigint, questionIndex: bigint): Promise<QuestionResultsResponse>;
    getPlayerState(roomPin: string, playerToken: bigint): Promise<PlayerStateResponse>;
    getPlayerStreaks(roomPin: string, playerToken: bigint): Promise<Array<StreakEntry>>;
    getPostGameSummary(sessionId: bigint): Promise<PostGameSummaryResponse>;
    getProfile(): Promise<Profile | null>;
    getQuestionResults(sessionId: bigint, questionIndex: bigint): Promise<QuestionResultsResponse>;
    getQuiz(quizId: bigint): Promise<Quiz | null>;
    getQuizzes(): Promise<Array<Quiz>>;
    getReport(reportId: bigint): Promise<Report | null>;
    getReports(): Promise<Array<ReportSummary>>;
    getSessionState(sessionId: bigint): Promise<SessionStateResponse>;
    getStreaks(sessionId: bigint): Promise<Array<StreakEntry>>;
    hostHeartbeat(sessionId: bigint): Promise<void>;
    joinSession(roomPin: string, displayName: string): Promise<JoinResult>;
    lockSession(sessionId: bigint, locked: boolean): Promise<void>;
    removePlayer(sessionId: bigint, playerId: bigint): Promise<void>;
    setAutoAdvance(sessionId: bigint, enabled: boolean): Promise<void>;
    setProfile(name: string): Promise<void>;
    startGame(sessionId: bigint): Promise<void>;
    submitAnswer(roomPin: string, playerToken: bigint, answer: AnswerSubmission): Promise<void>;
    updatePlayerName(roomPin: string, playerToken: bigint, newName: string): Promise<void>;
    updateQuiz(quizId: bigint, title: string, questions: Array<Question>): Promise<void>;
}
