# QuizBattle

## Overview

QuizBattle is a real-time multiplayer quiz platform built on the Internet Computer Protocol. Hosts create quizzes and launch live sessions; players join using a 6-digit room PIN and a display name — no account required. The platform supports timed questions across four question types, speed-based scoring, answer streaks, live leaderboards, and a dramatic podium finale. Designed for education, team events, and social gatherings, it delivers a high-energy competitive quiz experience. Hosts authenticate via Internet Identity; all quiz data, sessions, and reports are persisted on-chain.

## Authentication

- Hosts authenticate via Internet Identity. All quiz management, session hosting, and report access require authentication.
- Players do not need an account. They join sessions using a room PIN and a display name.
- Each player receives a unique token on join, used to authenticate subsequent actions (answer submission, name updates, state polling).
- Player session credentials (room PIN, player token, player ID) are persisted in the browser's local storage, enabling reconnection if the browser is closed or refreshed during an active game.
- Host data (quizzes, reports) is isolated by principal — hosts can only access their own quizzes and reports.

### Host Profile

- Hosts can set a display name (required, max 100 characters).
- Profile is stored per principal.

## Core Features

### Quiz Creation & Management

Hosts can create, edit, and delete quizzes from their dashboard.

- **Title**: required, max 200 characters.
- **Questions**: 1–100 per quiz.
- **Max quizzes per host**: 50.

Each question has:

- **Question text**: required, max 200 characters.
- **Question type**: one of Quiz, True or False, Type Answer, or Slider.
- **Time limit**: must be > 0 seconds. Predefined options: 5s, 10s, 15s, 20s, 30s, 45s, 1m, 1m 30s, 2m, 3m, 4m. Hosts can apply a time limit to all questions at once.
- **Point mode**: Standard (1000 max), Double Points (2000 max), or No Points (0).
- **Show question to players toggle**: when disabled, question text is hidden from players (useful for image-only questions).
- **Optional image attachment**: displayed as centered media or full question background.
- **Visual theme**: Standard, Winter, Spring, Festive, or Professional. Each theme defines a gradient background and accent colors.

#### Quiz Question Type

Question type determines the answer format:

- **Quiz**: 2–4 multiple choice options (max 100 characters each). At least one correct answer required. Supports single-select or multi-select — multi-select requires all correct options to be selected for full credit.
- **True or False**: exactly 2 options, exactly 1 correct answer.
- **Type Answer**: free-text input matched case-insensitively against accepted answers (1–20 accepted answers, each max 100 characters).
- **Slider**: numeric value within a configurable min/max range. Correct answer must be within range. Exact match required.

#### Quiz Builder

- Question sidebar displays all questions as draggable cards supporting reorder, duplication, and deletion (including touch-based drag on mobile).
- Live preview shows how the current question will appear to players.

### Live Sessions

#### Session Creation

- Starting a quiz session generates a unique 6-digit room PIN (100000–999999), derived from cryptographic randomness (`raw_rand`).
- Expired sessions (ended > 24 hours ago) are cleaned up automatically on session creation.

#### Lobby Phase

- Players join using the room PIN and a display name (1–50 characters).
- Display name uniqueness is enforced per session (case-insensitive).
- Join requests are rate-limited: 1-second cooldown per session to prevent spam.
- Maximum 50 concurrent players per session.
- Each player is assigned a random avatar index (0–23) from a predefined set of 24 illustrated characters.
- The host lobby displays joined players as avatar + name cards in real time, with a live player count.
- Players can edit their display name while in the lobby; once the game starts, names are locked.
- The host can:
  - Remove any player from the lobby (also works during active game).
  - Lock/unlock the session to prevent new joins.
  - Start the game (requires at least 1 player).

#### Game Flow

The game progresses through a defined phase sequence:

1. **Question Display** (~3 seconds): question text shown to all; answer options not yet available. Players see a countdown animation.
2. **Answering**: answer options revealed simultaneously to all players. Countdown timer runs for the configured time limit. Players can submit one answer per question; selection locks after submission or time expiry.
3. **Results**: bar chart of answer distribution shown to all participants, with correct answer(s) highlighted. Players see whether they were correct and points earned.
4. **Scoreboard**: top 5 players displayed with avatar, name, and cumulative score. Players not in the top 5 see their own rank and the player directly above them. Up to 5 players on active streaks (2+ consecutive correct) are displayed separately.
5. Repeat from step 1 for next question, or proceed to Podium if all questions are complete.
6. **Podium**: top 3 players revealed sequentially (3rd → 2nd → 1st) with avatar, name, and final score. Confetti celebration effect. Players outside top 3 see their own final rank and score.
7. **Ended**: session archived as a report; room PIN released.

Phase advancement:

- The host advances manually via a "Next" button, or enables auto-advance mode for automatic progression when timers expire.
- Auto-advance from answering to results happens automatically when the question timer expires (checked via host heartbeat).
- Auto-advance to results also triggers when all players have answered (regardless of auto-advance setting).
- Removing a player during the answering phase also checks if all remaining players have answered and auto-advances if so.
- The host can end the session early at any time — if the game was active (past lobby), it archives as a report.

#### Host Heartbeat

- The host sends periodic heartbeats to signal presence and trigger server-side auto-advance logic.
- Players detect host disconnection after 15 seconds of no heartbeat and display a notification.

### Scoring

- Points are awarded for correct answers only.
- Score = base + time bonus, where:
  - Standard: max 1000 points (500 base + up to 500 time bonus).
  - Double: max 2000 points (1000 base + up to 1000 time bonus).
  - No Points: 0 points regardless of correctness.
- Time bonus scales linearly: faster answers earn more points. Answering instantly earns max points; answering at the deadline earns only the base.
- Incorrect answers always earn 0 points.

### Streaks

- A streak increments for each consecutive correct answer.
- Incorrect answer or not answering resets the streak to 0.
- Streaks are purely a display mechanic — they do not award bonus points.
- Up to 5 players on active streaks (2+ consecutive correct) are shown on the scoreboard.
- Players receive a personal notification when on an active streak.

### Reports

Completed game sessions are automatically archived as reports.

- **Max reports per host**: 1,000. Oldest report is auto-evicted when exceeded.
- Only sessions that progressed past the lobby phase are archived.
- Each report captures:
  - Quiz title, play date, player count, question count.
  - Full question definitions with correct answers.
  - Player rankings (sorted by score) with per-question answer breakdowns (selected options, text answer, slider value, correctness, points earned).
  - Post-game summary with per-question answer distributions and correct percentages.
- Hosts can browse reports chronologically, view detailed report data, and delete individual reports.

### Dashboard

- Shows quiz count and report count.
- Quick-access links to quizzes, reports, quiz creation, and joining a game.

## Backend Data Storage

All state is persisted on-chain via Motoko orthogonal persistence:

- **User profiles**: `Map<Principal, Profile>` — host display name.
- **User quizzes**: `Map<Principal, Map<Nat, Quiz>>` — per-host quiz storage with auto-incrementing IDs.
- **Sessions**: `Map<Nat, Session>` — active game sessions with player data, answers, and phase state.
- **Room PIN index**: `Map<Text, Nat>` — maps 6-digit PINs to session IDs for fast lookup.
- **User reports**: `Map<Principal, Map<Nat, Report>>` — per-host archived game reports.
- **Rate limiting**: `transient Map<Nat, Int>` — last join timestamp per session (resets on canister upgrade).

Data isolation: quizzes and reports are scoped per authenticated host principal. Session data is shared across host and players during gameplay.

## Backend Operations

- **Authentication**: all host operations require non-anonymous principal via `requireAuth`. Player operations authenticate via player token.
- **Authorization**: session management operations (advance, lock, remove, end) verify the caller is the session host via `requireHost`.
- **Input validation**: quiz title length, question text length, option text length, accepted answer count, slider range validity, option index bounds, display name length and uniqueness.
- **Error handling**: all errors use `Runtime.trap()` with descriptive messages.
- **Room PIN generation**: uses cryptographic randomness (`raw_rand`) with collision checking (up to 100 attempts).
- **Player token generation**: uses cryptographic randomness (`raw_rand`) for secure, unpredictable tokens.
- **Avatar assignment**: uses non-cryptographic randomness (time-based seed) since avatars are cosmetic only.
- **Session cleanup**: expired ended sessions (> 24 hours) are automatically cleaned up on new session creation.

## User Interface

### Main Screens

- **Landing page**: entry point with options to sign in as host or join a game as a player.
- **Dashboard**: host hub showing quiz count, report count, and quick-action links.
- **Quizzes page**: list of host's quizzes with create, edit, and delete actions.
- **Quiz builder**: full-featured editor with question sidebar, question editor, properties panel, and live preview.
- **Reports list page**: chronological list of archived game reports.
- **Report detail page**: per-question breakdowns, player rankings, and individual answer data.

### Game Screens

- **Host lobby**: room PIN display (with copy), player cards animating in, lock toggle, player count, start button.
- **Host game screen**: current question display, answer count, timer, phase controls (next/auto-advance), mute button.
- **Player join flow**: room PIN entry, display name entry, avatar assignment.
- **Player lobby**: player list, own name editing, waiting state.
- **Player game screen**: question display, answer options (color-coded tiles), timer, feedback (correct/incorrect + points).
- **Results phase**: bar chart of answer distribution with correct answers highlighted.
- **Scoreboard phase**: top 5 leaderboard + streak display; own rank for non-top-5 players.
- **Podium phase**: sequential reveal of 3rd, 2nd, 1st place with confetti effect; own rank for non-podium players.
- **Post-game summary**: question-by-question breakdown (host view).

### Answer Option Styling

Each answer option uses a distinct color and shape:

- A: Red triangle
- B: Blue diamond
- C: Yellow circle
- D: Green square

### Sound & Music

All audio is synthesized via the Web Audio API (no external audio files):

- Lobby/game background music loop.
- Question countdown tension sound.
- Answer reveal cue.
- Correct/incorrect feedback sounds.
- Streak sound effect.
- Podium reveal fanfare.
- Both host and player have mute controls.

## Design System

- Bold, arcade-style visual language with deep purple as the dominant background.
- Bright accent colors, large rounded typography, high-contrast white text.
- Host screen optimized for projection — large text, minimal UI chrome.
- Answer tiles are large, full-width, and color-coded for easy mobile tapping.
- Per-question visual themes with gradient backgrounds (Standard, Winter, Spring, Festive, Professional).
- Player avatars are illustrated cartoon characters displayed across lobby, scoreboard, and podium.
- Smooth animations throughout: question transitions, answer reveals, scoreboard entries sliding in, podium characters appearing.
- Confetti celebration effect on podium screen.
- Fully responsive across mobile, tablet, and desktop.

## Error Handling

- **Authentication errors**: "Not authenticated" when anonymous principal attempts host actions.
- **Authorization errors**: "Only the host can perform this action" for non-host callers on host-only endpoints.
- **Validation errors**: descriptive messages for invalid input (empty fields, exceeded length limits, out-of-range values, invalid question configurations).
- **Session state errors**: "Game has already started", "Session has ended", "Session is locked", "Session is full (max 50 players)", "Can only start from lobby", "Cannot start with no players".
- **Game flow errors**: "Not in answering phase", "Already answered this question", "Time is up", "Cannot advance from current phase".
- **Not found errors**: "Quiz not found", "Session not found", "Player not found", "Invalid room PIN", "Report not found".
- **Rate limiting**: "Too many join attempts — please try again" (1-second cooldown per session).
- **Capacity limits**: "Cannot create more than 50 quizzes", max 1000 reports (oldest auto-evicted).
- **Display name conflicts**: "Display name is already taken in this session" (case-insensitive check).
