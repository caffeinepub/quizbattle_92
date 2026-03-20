import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import List "mo:core/List";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Char "mo:core/Char";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";

actor {
  include MixinStorage();

  // Types

  type Profile = {
    name : Text;
  };

  type PointMode = {
    #standard;
    #double;
    #none;
  };

  type QuestionType = {
    #quiz;
    #trueFalse;
    #typeAnswer;
    #slider;
  };

  type ImagePlacement = {
    #centered;
    #background;
  };

  type Question = {
    questionType : QuestionType;
    text : Text;
    options : [Text];
    correctOptionIndices : [Nat];
    timeLimit : Nat;
    pointMode : PointMode;
    isMultiSelect : Bool;
    acceptedAnswers : [Text];
    sliderMin : Nat;
    sliderMax : Nat;
    sliderCorrect : Nat;
    image : ?Storage.ExternalBlob;
    imagePlacement : ImagePlacement;
    theme : Text;
    showQuestionToPlayers : Bool;
  };

  type Quiz = {
    id : Nat;
    title : Text;
    questions : [Question];
    createdAt : Int;
    updatedAt : Int;
  };

  type SessionStatus = {
    #lobby;
    #active;
    #ended;
  };

  type GamePhase = {
    #lobby;
    #questionDisplay;
    #answering;
    #results;
    #scoreboard;
    #podium;
    #ended;
  };

  type AnswerSubmission = {
    #options : [Nat];
    #text : Text;
    #slider : Nat;
  };

  type PlayerAnswer = {
    selectedOptions : [Nat];
    textAnswer : Text;
    sliderValue : Nat;
    submittedAt : Int;
    isCorrect : Bool;
    pointsEarned : Nat;
  };

  type PlayerData = {
    token : Nat;
    playerId : Nat;
    displayName : Text;
    avatarIndex : Nat;
    score : Nat;
    currentStreak : Nat;
    answers : Map.Map<Nat, PlayerAnswer>;
    joinedAt : Int;
  };

  type Session = {
    id : Nat;
    quizId : Nat;
    hostPrincipal : Principal;
    roomPin : Text;
    status : SessionStatus;
    players : Map.Map<Nat, PlayerData>;
    isLocked : Bool;
    autoAdvance : Bool;
    currentQuestionIndex : Nat;
    currentPhase : GamePhase;
    phaseStartTime : Int;
    questions : [Question];
    lastHostHeartbeat : Int;
    nextPlayerId : Nat;
  };

  type JoinResult = {
    playerToken : Nat;
    playerId : Nat;
    sessionId : Nat;
    avatarIndex : Nat;
  };

  type SessionInfo = {
    sessionId : Nat;
    roomPin : Text;
  };

  type PublicPlayerData = {
    playerId : Nat;
    displayName : Text;
    avatarIndex : Nat;
    score : Nat;
  };

  type HostQuestionData = {
    questionType : QuestionType;
    text : Text;
    options : [Text];
    correctOptionIndices : [Nat];
    timeLimit : Nat;
    pointMode : PointMode;
    acceptedAnswers : [Text];
    sliderMin : Nat;
    sliderMax : Nat;
    sliderCorrect : Nat;
    image : ?Storage.ExternalBlob;
    imagePlacement : ImagePlacement;
    theme : Text;
    showQuestionToPlayers : Bool;
  };

  type PlayerQuestionData = {
    questionType : QuestionType;
    text : Text;
    options : [Text];
    timeLimit : Nat;
    sliderMin : Nat;
    sliderMax : Nat;
    image : ?Storage.ExternalBlob;
    imagePlacement : ImagePlacement;
    theme : Text;
    showQuestionToPlayers : Bool;
  };

  type SessionStateResponse = {
    sessionId : Nat;
    roomPin : Text;
    status : SessionStatus;
    currentPhase : GamePhase;
    currentQuestionIndex : Nat;
    isLocked : Bool;
    autoAdvance : Bool;
    playerCount : Nat;
    players : [PublicPlayerData];
    phaseStartTime : Int;
    questionCount : Nat;
    currentQuestion : ?HostQuestionData;
    answerCount : Nat;
  };

  type PlayerStateResponse = {
    status : SessionStatus;
    currentPhase : GamePhase;
    isLocked : Bool;
    players : [PublicPlayerData];
    playerCount : Nat;
    ownDisplayName : Text;
    ownAvatarIndex : Nat;
    ownScore : Nat;
    currentQuestionIndex : Nat;
    currentQuestion : ?PlayerQuestionData;
    phaseStartTime : Int;
    hasAnsweredCurrent : Bool;
    lastAnswerCorrect : ?Bool;
    lastPointsEarned : Nat;
    currentStreak : Nat;
    lastHostHeartbeat : Int;
  };

  type AnswerDistribution = {
    optionIndex : Nat;
    count : Nat;
    isCorrect : Bool;
  };

  type QuestionResultsResponse = {
    questionType : QuestionType;
    questionIndex : Nat;
    questionText : Text;
    options : [Text];
    answerDistribution : [AnswerDistribution];
    totalAnswers : Nat;
    correctCount : Nat;
  };

  type LeaderboardEntry = {
    playerId : Nat;
    displayName : Text;
    avatarIndex : Nat;
    score : Nat;
    rank : Nat;
    currentStreak : Nat;
  };

  type LeaderboardResponse = {
    entries : [LeaderboardEntry];
    totalPlayers : Nat;
  };

  type StreakEntry = {
    displayName : Text;
    avatarIndex : Nat;
    streak : Nat;
  };

  type QuestionSummary = {
    questionType : QuestionType;
    questionIndex : Nat;
    questionText : Text;
    options : [Text];
    answerDistribution : [AnswerDistribution];
    totalAnswers : Nat;
    correctCount : Nat;
    correctPercent : Nat;
  };

  type PostGameSummaryResponse = {
    questionSummaries : [QuestionSummary];
    totalPlayers : Nat;
    totalQuestions : Nat;
  };

  type ArchivedPlayerAnswer = {
    questionIndex : Nat;
    selectedOptions : [Nat];
    textAnswer : Text;
    sliderValue : Nat;
    isCorrect : Bool;
    pointsEarned : Nat;
  };

  type ArchivedPlayer = {
    displayName : Text;
    avatarIndex : Nat;
    score : Nat;
    rank : Nat;
    answers : [ArchivedPlayerAnswer];
  };

  type ArchivedQuestion = {
    questionType : QuestionType;
    text : Text;
    options : [Text];
    correctOptionIndices : [Nat];
    acceptedAnswers : [Text];
    sliderMin : Nat;
    sliderMax : Nat;
    sliderCorrect : Nat;
  };

  type ReportSummary = {
    id : Nat;
    quizTitle : Text;
    playedAt : Int;
    playerCount : Nat;
    questionCount : Nat;
  };

  type Report = {
    id : Nat;
    quizTitle : Text;
    playedAt : Int;
    playerCount : Nat;
    questionCount : Nat;
    questions : [ArchivedQuestion];
    players : [ArchivedPlayer];
    summary : PostGameSummaryResponse;
  };

  // State

  var userProfiles : Map.Map<Principal, Profile> = Map.empty();
  var userQuizzes : Map.Map<Principal, Map.Map<Nat, Quiz>> = Map.empty();
  var nextQuizId : Nat = 0;
  var sessions : Map.Map<Nat, Session> = Map.empty();
  var roomPinIndex : Map.Map<Text, Nat> = Map.empty();
  var nextSessionId : Nat = 0;
  var randomSeed : Nat = 0;
  var userReports : Map.Map<Principal, Map.Map<Nat, Report>> = Map.empty();
  var nextReportId : Nat = 0;

  // Rate limiting: tracks last join timestamp per session to throttle rapid joins
  transient var lastJoinTime : Map.Map<Nat, Int> = Map.empty();

  // Constants

  let SESSION_RETENTION_NS : Int = 86_400_000_000_000; // 24 hours
  let MAX_QUESTIONS_PER_QUIZ : Nat = 100;
  let MAX_QUESTION_TEXT_LENGTH : Nat = 200;
  let MAX_OPTION_TEXT_LENGTH : Nat = 100;
  let MAX_ACCEPTED_ANSWERS : Nat = 20;
  let MAX_QUIZZES_PER_USER : Nat = 50;
  let MAX_REPORTS_PER_USER : Nat = 1000;
  let JOIN_COOLDOWN_NS : Int = 1_000_000_000; // 1 second between joins per session

  // Helpers

  func cleanupExpiredSessions() {
    let now = Time.now();
    let toRemove = List.empty<Nat>();
    for ((id, session) in sessions.entries()) {
      switch (session.status) {
        case (#ended) {
          if (now - session.phaseStartTime > SESSION_RETENTION_NS) {
            toRemove.add(id);
          };
        };
        case (_) {};
      };
    };
    for (id in toRemove.values()) {
      sessions.remove(id);
    };
  };

  func requireAuth(caller : Principal) {
    if (caller.isAnonymous()) {
      Runtime.trap("Not authenticated");
    };
  };

  func getUserQuizzes(user : Principal) : Map.Map<Nat, Quiz> {
    switch (userQuizzes.get(user)) {
      case (?m) { m };
      case (null) {
        let m = Map.empty<Nat, Quiz>();
        userQuizzes.add(user, m);
        m;
      };
    };
  };

  func getUserReports(user : Principal) : Map.Map<Nat, Report> {
    switch (userReports.get(user)) {
      case (?m) { m };
      case (null) {
        let m = Map.empty<Nat, Report>();
        userReports.add(user, m);
        m;
      };
    };
  };

  func validateQuestions(questions : [Question]) {
    if (questions.size() == 0) {
      Runtime.trap("Quiz must have at least one question");
    };
    if (questions.size() > MAX_QUESTIONS_PER_QUIZ) {
      Runtime.trap("Quiz cannot have more than " # MAX_QUESTIONS_PER_QUIZ.toText() # " questions");
    };
    for (q in questions.vals()) {
      if (q.text == "") {
        Runtime.trap("Question text cannot be empty");
      };
      if (q.text.size() > MAX_QUESTION_TEXT_LENGTH) {
        Runtime.trap("Question text must be " # MAX_QUESTION_TEXT_LENGTH.toText() # " characters or fewer");
      };
      if (q.timeLimit == 0) {
        Runtime.trap("Time limit must be greater than 0");
      };
      // Validate option text lengths
      for (opt in q.options.vals()) {
        if (opt.size() > MAX_OPTION_TEXT_LENGTH) {
          Runtime.trap("Option text must be " # MAX_OPTION_TEXT_LENGTH.toText() # " characters or fewer");
        };
      };
      switch (q.questionType) {
        case (#quiz) {
          if (q.options.size() < 2 or q.options.size() > 4) {
            Runtime.trap("Quiz questions must have 2-4 options");
          };
          if (q.correctOptionIndices.size() == 0) {
            Runtime.trap("Quiz questions must have at least one correct answer");
          };
          for (idx in q.correctOptionIndices.vals()) {
            if (idx >= q.options.size()) {
              Runtime.trap("Correct option index out of range");
            };
          };
        };
        case (#trueFalse) {
          if (q.options.size() != 2) {
            Runtime.trap("True/False questions must have exactly 2 options");
          };
          if (q.correctOptionIndices.size() != 1) {
            Runtime.trap("True/False questions must have exactly one correct answer");
          };
          if (q.correctOptionIndices[0] >= 2) {
            Runtime.trap("Correct option index out of range");
          };
        };
        case (#typeAnswer) {
          if (q.acceptedAnswers.size() == 0) {
            Runtime.trap("Type Answer questions must have at least one accepted answer");
          };
          if (q.acceptedAnswers.size() > MAX_ACCEPTED_ANSWERS) {
            Runtime.trap("Type Answer questions cannot have more than " # MAX_ACCEPTED_ANSWERS.toText() # " accepted answers");
          };
          for (ans in q.acceptedAnswers.vals()) {
            if (ans.size() > MAX_OPTION_TEXT_LENGTH) {
              Runtime.trap("Accepted answer text must be " # MAX_OPTION_TEXT_LENGTH.toText() # " characters or fewer");
            };
          };
        };
        case (#slider) {
          if (q.sliderMin >= q.sliderMax) {
            Runtime.trap("Slider min must be less than max");
          };
          if (q.sliderCorrect < q.sliderMin or q.sliderCorrect > q.sliderMax) {
            Runtime.trap("Slider correct value must be within min/max range");
          };
        };
      };
    };
  };

  let mgmt : actor { raw_rand : () -> async Blob } = actor ("aaaaa-aa");

  func secureRandom() : async Nat {
    let randBytes = await mgmt.raw_rand();
    var n : Nat = 0;
    var i = 0;
    for (byte in randBytes.vals()) {
      if (i < 8) {
        n := n * 256 + byte.toNat();
        i += 1;
      };
    };
    n;
  };

  // Non-cryptographic random for cosmetic purposes only (e.g. avatar index)
  func cosmeticRandom() : Nat {
    randomSeed += 1;
    let time = Int.abs(Time.now());
    time + (randomSeed * 6364136223846793005) + 1442695040888963407;
  };

  func generateRoomPin() : async Text {
    var pin = "";
    var attempts = 0;
    loop {
      let raw = await secureRandom();
      pin := (raw % 900000 + 100000).toText();
      attempts += 1;
      if (attempts > 100) {
        Runtime.trap("Could not generate unique room PIN");
      };
    } while (roomPinIndex.get(pin) != null);
    pin;
  };

  func generatePlayerToken() : async Nat {
    await secureRandom();
  };

  func getSession(sessionId : Nat) : Session {
    switch (sessions.get(sessionId)) {
      case (?s) { s };
      case (null) { Runtime.trap("Session not found") };
    };
  };

  func requireHost(caller : Principal, session : Session) {
    if (caller != session.hostPrincipal) {
      Runtime.trap("Only the host can perform this action");
    };
  };

  func getPublicPlayers(session : Session) : [PublicPlayerData] {
    let result = List.empty<PublicPlayerData>();
    for ((_, p) in session.players.entries()) {
      result.add({
        playerId = p.playerId;
        displayName = p.displayName;
        avatarIndex = p.avatarIndex;
        score = p.score;
      });
    };
    result.toArray();
  };

  func replaceSession(
    session : Session,
    updates : {
      status : ?SessionStatus;
      isLocked : ?Bool;
      currentPhase : ?GamePhase;
      phaseStartTime : ?Int;
      currentQuestionIndex : ?Nat;
      autoAdvance : ?Bool;
    },
  ) {
    let updated : Session = {
      id = session.id;
      quizId = session.quizId;
      hostPrincipal = session.hostPrincipal;
      roomPin = session.roomPin;
      status = switch (updates.status) {
        case (?s) { s };
        case (null) { session.status };
      };
      players = session.players;
      isLocked = switch (updates.isLocked) {
        case (?l) { l };
        case (null) { session.isLocked };
      };
      autoAdvance = switch (updates.autoAdvance) {
        case (?a) { a };
        case (null) { session.autoAdvance };
      };
      currentQuestionIndex = switch (updates.currentQuestionIndex) {
        case (?i) { i };
        case (null) { session.currentQuestionIndex };
      };
      currentPhase = switch (updates.currentPhase) {
        case (?p) { p };
        case (null) { session.currentPhase };
      };
      phaseStartTime = switch (updates.phaseStartTime) {
        case (?t) { t };
        case (null) { session.phaseStartTime };
      };
      questions = session.questions;
      lastHostHeartbeat = session.lastHostHeartbeat;
      nextPlayerId = session.nextPlayerId;
    };
    sessions.add(session.id, updated);
  };

  func getSessionByPin(roomPin : Text) : Session {
    let sessionId = switch (roomPinIndex.get(roomPin)) {
      case (?id) { id };
      case (null) { Runtime.trap("Invalid room PIN") };
    };
    getSession(sessionId);
  };

  func getPlayerByToken(session : Session, playerToken : Nat) : PlayerData {
    switch (session.players.get(playerToken)) {
      case (?p) { p };
      case (null) { Runtime.trap("Player not found") };
    };
  };

  func getTokenByPlayerId(session : Session, playerId : Nat) : Nat {
    for ((token, p) in session.players.entries()) {
      if (p.playerId == playerId) { return token };
    };
    Runtime.trap("Player not found");
  };

  func toLower(t : Text) : Text {
    t.map(
      func(c) {
        if (c >= 'A' and c <= 'Z') {
          Char.fromNat32(c.toNat32() + 32);
        } else {
          c;
        };
      }
    );
  };

  func isNameTaken(session : Session, name : Text, excludeToken : ?Nat) : Bool {
    let nameLower = toLower(name);
    for ((token, player) in session.players.entries()) {
      switch (excludeToken) {
        case (?exclude) {
          if (token == exclude) { /* skip self */ } else {
            if (toLower(player.displayName) == nameLower) { return true };
          };
        };
        case (null) {
          if (toLower(player.displayName) == nameLower) { return true };
        };
      };
    };
    false;
  };

  func getCurrentQuestion(session : Session) : Question {
    if (session.currentQuestionIndex >= session.questions.size()) {
      Runtime.trap("No current question");
    };
    session.questions[session.currentQuestionIndex];
  };

  func buildQuestionResults(session : Session, questionIndex : Nat) : QuestionResultsResponse {
    let question = session.questions[questionIndex];
    var totalAnswers = 0;
    var correctCount = 0;

    switch (question.questionType) {
      case (#quiz or #trueFalse) {
        let optionCounts = Map.empty<Nat, Nat>();
        for (i in question.options.keys()) {
          optionCounts.add(i, 0);
        };
        for ((_, player) in session.players.entries()) {
          switch (player.answers.get(questionIndex)) {
            case (?answer) {
              totalAnswers += 1;
              if (answer.isCorrect) { correctCount += 1 };
              for (optIdx in answer.selectedOptions.vals()) {
                switch (optionCounts.get(optIdx)) {
                  case (?c) { optionCounts.add(optIdx, c + 1) };
                  case (null) {};
                };
              };
            };
            case (null) {};
          };
        };
        let distribution = List.empty<AnswerDistribution>();
        for (i in question.options.keys()) {
          var isCorrectOption = false;
          for (c in question.correctOptionIndices.vals()) {
            if (c == i) { isCorrectOption := true };
          };
          let count = switch (optionCounts.get(i)) {
            case (?c) { c };
            case (null) { 0 };
          };
          distribution.add({
            optionIndex = i;
            count;
            isCorrect = isCorrectOption;
          });
        };
        {
          questionType = question.questionType;
          questionIndex;
          questionText = question.text;
          options = question.options;
          answerDistribution = distribution.toArray();
          totalAnswers;
          correctCount;
        };
      };
      case (#typeAnswer) {
        // Group actual text answers by value (case-insensitive)
        let answerCounts = Map.empty<Text, Nat>();
        let answerLabels = Map.empty<Text, Text>();
        for ((_, player) in session.players.entries()) {
          switch (player.answers.get(questionIndex)) {
            case (?answer) {
              totalAnswers += 1;
              if (answer.isCorrect) { correctCount += 1 };
              let key = toLower(answer.textAnswer);
              switch (answerCounts.get(key)) {
                case (?c) { answerCounts.add(key, c + 1) };
                case (null) {
                  answerCounts.add(key, 1);
                  answerLabels.add(key, answer.textAnswer);
                };
              };
            };
            case (null) {};
          };
        };
        let opts = List.empty<Text>();
        let dist = List.empty<AnswerDistribution>();
        var idx : Nat = 0;
        for ((key, count) in answerCounts.entries()) {
          let answerText = switch (answerLabels.get(key)) {
            case (?l) { l };
            case (null) { key };
          };
          opts.add(answerText);
          var isAcc = false;
          for (accepted in question.acceptedAnswers.vals()) {
            if (toLower(accepted) == key) { isAcc := true };
          };
          dist.add({ optionIndex = idx; count; isCorrect = isAcc });
          idx += 1;
        };
        {
          questionType = question.questionType;
          questionIndex;
          questionText = question.text;
          options = opts.toArray();
          answerDistribution = dist.toArray();
          totalAnswers;
          correctCount;
        };
      };
      case (#slider) {
        // Group actual slider values
        let valueCounts = Map.empty<Nat, Nat>();
        for ((_, player) in session.players.entries()) {
          switch (player.answers.get(questionIndex)) {
            case (?answer) {
              totalAnswers += 1;
              if (answer.isCorrect) { correctCount += 1 };
              switch (valueCounts.get(answer.sliderValue)) {
                case (?c) { valueCounts.add(answer.sliderValue, c + 1) };
                case (null) { valueCounts.add(answer.sliderValue, 1) };
              };
            };
            case (null) {};
          };
        };
        let opts = List.empty<Text>();
        let dist = List.empty<AnswerDistribution>();
        var idx : Nat = 0;
        for ((value, count) in valueCounts.entries()) {
          opts.add(value.toText());
          dist.add({
            optionIndex = idx;
            count;
            isCorrect = value == question.sliderCorrect;
          });
          idx += 1;
        };
        {
          questionType = question.questionType;
          questionIndex;
          questionText = question.text;
          options = opts.toArray();
          answerDistribution = dist.toArray();
          totalAnswers;
          correctCount;
        };
      };
    };
  };

  func buildLeaderboard(session : Session) : LeaderboardResponse {
    let entries = List.empty<LeaderboardEntry>();
    for ((_, player) in session.players.entries()) {
      entries.add({
        playerId = player.playerId;
        displayName = player.displayName;
        avatarIndex = player.avatarIndex;
        score = player.score;
        rank = 0;
        currentStreak = player.currentStreak;
      });
    };
    entries.sortInPlace(func(a, b) { Nat.compare(b.score, a.score) });
    let ranked = List.empty<LeaderboardEntry>();
    var rank : Nat = 1;
    for (entry in entries.values()) {
      ranked.add({
        playerId = entry.playerId;
        displayName = entry.displayName;
        avatarIndex = entry.avatarIndex;
        score = entry.score;
        rank;
        currentStreak = entry.currentStreak;
      });
      rank += 1;
    };
    {
      entries = ranked.toArray();
      totalPlayers = session.players.size();
    };
  };

  func buildStreaks(session : Session) : [StreakEntry] {
    let streaks = List.empty<StreakEntry>();
    for ((_, player) in session.players.entries()) {
      if (player.currentStreak >= 2) {
        streaks.add({
          displayName = player.displayName;
          avatarIndex = player.avatarIndex;
          streak = player.currentStreak;
        });
      };
    };
    streaks.sortInPlace(func(a, b) { Nat.compare(b.streak, a.streak) });
    let result = List.empty<StreakEntry>();
    var count = 0;
    for (entry in streaks.values()) {
      if (count < 5) {
        result.add(entry);
        count += 1;
      };
    };
    result.toArray();
  };

  func buildPostGameSummary(session : Session) : PostGameSummaryResponse {
    let summaries = List.empty<QuestionSummary>();
    for (i in session.questions.keys()) {
      let results = buildQuestionResults(session, i);
      let pct : Nat = if (results.totalAnswers > 0) {
        results.correctCount * 100 / results.totalAnswers;
      } else {
        0;
      };
      summaries.add({
        questionType = results.questionType;
        questionIndex = results.questionIndex;
        questionText = results.questionText;
        options = results.options;
        answerDistribution = results.answerDistribution;
        totalAnswers = results.totalAnswers;
        correctCount = results.correctCount;
        correctPercent = pct;
      });
    };
    {
      questionSummaries = summaries.toArray();
      totalPlayers = session.players.size();
      totalQuestions = session.questions.size();
    };
  };

  func archiveSession(session : Session) {
    let reports = getUserReports(session.hostPrincipal);

    // Evict oldest if over limit
    if (reports.size() >= MAX_REPORTS_PER_USER) {
      var oldestId : Nat = 0;
      var oldestTime : Int = 9_223_372_036_854_775_807; // Int max
      for ((id, report) in reports.entries()) {
        if (report.playedAt < oldestTime) {
          oldestTime := report.playedAt;
          oldestId := id;
        };
      };
      reports.remove(oldestId);
    };

    let reportId = nextReportId;
    nextReportId += 1;

    // Build archived questions
    let archivedQuestions = List.empty<ArchivedQuestion>();
    for (q in session.questions.vals()) {
      archivedQuestions.add({
        questionType = q.questionType;
        text = q.text;
        options = q.options;
        correctOptionIndices = q.correctOptionIndices;
        acceptedAnswers = q.acceptedAnswers;
        sliderMin = q.sliderMin;
        sliderMax = q.sliderMax;
        sliderCorrect = q.sliderCorrect;
      });
    };

    // Build sorted player list with ranks
    let playerList = List.empty<{ displayName : Text; avatarIndex : Nat; score : Nat; answers : Map.Map<Nat, PlayerAnswer> }>();
    for ((_, p) in session.players.entries()) {
      playerList.add({
        displayName = p.displayName;
        avatarIndex = p.avatarIndex;
        score = p.score;
        answers = p.answers;
      });
    };
    playerList.sortInPlace(func(a, b) { Nat.compare(b.score, a.score) });

    let archivedPlayers = List.empty<ArchivedPlayer>();
    var rank : Nat = 1;
    for (p in playerList.values()) {
      let archivedAnswers = List.empty<ArchivedPlayerAnswer>();
      for ((qIdx, answer) in p.answers.entries()) {
        archivedAnswers.add({
          questionIndex = qIdx;
          selectedOptions = answer.selectedOptions;
          textAnswer = answer.textAnswer;
          sliderValue = answer.sliderValue;
          isCorrect = answer.isCorrect;
          pointsEarned = answer.pointsEarned;
        });
      };
      archivedPlayers.add({
        displayName = p.displayName;
        avatarIndex = p.avatarIndex;
        score = p.score;
        rank;
        answers = archivedAnswers.toArray();
      });
      rank += 1;
    };

    // Get quiz title from the quiz (fallback to "Untitled Quiz")
    let quizTitle = switch (userQuizzes.get(session.hostPrincipal)) {
      case (?quizMap) {
        switch (quizMap.get(session.quizId)) {
          case (?quiz) { quiz.title };
          case (null) { "Untitled Quiz" };
        };
      };
      case (null) { "Untitled Quiz" };
    };

    let postGameSummary = buildPostGameSummary(session);

    let report : Report = {
      id = reportId;
      quizTitle;
      playedAt = Time.now();
      playerCount = session.players.size();
      questionCount = session.questions.size();
      questions = archivedQuestions.toArray();
      players = archivedPlayers.toArray();
      summary = postGameSummary;
    };

    reports.add(reportId, report);
  };

  func getAnswerCount(session : Session) : Nat {
    var count = 0;
    for ((_, player) in session.players.entries()) {
      if (player.answers.get(session.currentQuestionIndex) != null) {
        count += 1;
      };
    };
    count;
  };

  // Exact match: every selected option must be correct, and every correct option must be selected
  func checkCorrectness(selected : [Nat], correct : [Nat]) : Bool {
    if (selected.size() != correct.size()) { return false };
    for (s in selected.vals()) {
      var found = false;
      for (c in correct.vals()) {
        if (s == c) { found := true };
      };
      if (not found) { return false };
    };
    for (c in correct.vals()) {
      var found = false;
      for (s in selected.vals()) {
        if (c == s) { found := true };
      };
      if (not found) { return false };
    };
    true;
  };

  func computeScore(question : Question, submittedAt : Int, answeringStartTime : Int) : Nat {
    let maxPoints : Nat = switch (question.pointMode) {
      case (#standard) { 1000 };
      case (#double) { 2000 };
      case (#none) { 0 };
    };
    if (maxPoints == 0) {
      0;
    } else {
      // Score ranges from maxPoints/2 (slow) to maxPoints (instant)
      let halfPoints = maxPoints / 2;
      let timeLimitNs : Int = question.timeLimit * 1_000_000_000;
      let timeElapsed : Int = submittedAt - answeringStartTime;
      let timeRemainingNs : Int = timeLimitNs - timeElapsed;
      let timeBonus : Nat = if (timeRemainingNs > 0) {
        Int.abs(timeRemainingNs * halfPoints / timeLimitNs);
      } else {
        0;
      };
      halfPoints + timeBonus;
    };
  };

  func resetStreaksForNonAnswerers(session : Session) {
    let qIndex = session.currentQuestionIndex;
    for ((token, player) in session.players.entries()) {
      if (player.answers.get(qIndex) == null and player.currentStreak > 0) {
        session.players.add(
          token,
          {
            token = player.token;
            playerId = player.playerId;
            displayName = player.displayName;
            avatarIndex = player.avatarIndex;
            score = player.score;
            currentStreak = 0;
            answers = player.answers;
            joinedAt = player.joinedAt;
          },
        );
      };
    };
  };

  func updatePlayerData(session : Session, playerToken : Nat, updatedPlayer : PlayerData) {
    session.players.add(playerToken, updatedPlayer);
  };

  // Endpoints

  public query ({ caller }) func getProfile() : async ?Profile {
    requireAuth(caller);
    userProfiles.get(caller);
  };

  public shared ({ caller }) func setProfile(name : Text) : async () {
    requireAuth(caller);
    if (name == "") {
      Runtime.trap("Profile name cannot be empty");
    };
    if (name.size() > 100) {
      Runtime.trap("Name must be 100 characters or fewer");
    };
    userProfiles.add(caller, { name });
  };

  public shared ({ caller }) func createQuiz(title : Text, questions : [Question]) : async Nat {
    requireAuth(caller);
    if (title == "") {
      Runtime.trap("Quiz title cannot be empty");
    };
    if (title.size() > 200) {
      Runtime.trap("Quiz title must be 200 characters or fewer");
    };
    validateQuestions(questions);
    let quizMap = getUserQuizzes(caller);
    if (quizMap.size() >= MAX_QUIZZES_PER_USER) {
      Runtime.trap("Cannot create more than " # MAX_QUIZZES_PER_USER.toText() # " quizzes");
    };
    let id = nextQuizId;
    nextQuizId += 1;
    let now = Time.now();
    quizMap.add(id, { id; title; questions; createdAt = now; updatedAt = now });
    id;
  };

  public shared ({ caller }) func updateQuiz(quizId : Nat, title : Text, questions : [Question]) : async () {
    requireAuth(caller);
    if (title == "") {
      Runtime.trap("Quiz title cannot be empty");
    };
    if (title.size() > 200) {
      Runtime.trap("Quiz title must be 200 characters or fewer");
    };
    validateQuestions(questions);
    let quizMap = getUserQuizzes(caller);
    switch (quizMap.get(quizId)) {
      case (null) { Runtime.trap("Quiz not found") };
      case (?existing) {
        quizMap.add(quizId, { id = quizId; title; questions; createdAt = existing.createdAt; updatedAt = Time.now() });
      };
    };
  };

  public shared ({ caller }) func deleteQuiz(quizId : Nat) : async () {
    requireAuth(caller);
    let quizMap = getUserQuizzes(caller);
    switch (quizMap.get(quizId)) {
      case (null) { Runtime.trap("Quiz not found") };
      case (?_) { quizMap.remove(quizId) };
    };
  };

  public query ({ caller }) func getQuizzes() : async [Quiz] {
    requireAuth(caller);
    let quizMap = getUserQuizzes(caller);
    let result = List.empty<Quiz>();
    for ((_, quiz) in quizMap.entries()) {
      result.add(quiz);
    };
    result.toArray();
  };

  public query ({ caller }) func getQuiz(quizId : Nat) : async ?Quiz {
    requireAuth(caller);
    let quizMap = getUserQuizzes(caller);
    quizMap.get(quizId);
  };

  public shared ({ caller }) func createSession(quizId : Nat) : async SessionInfo {
    requireAuth(caller);
    // Generate PIN before state reads so the await yield happens first
    let pin = await generateRoomPin();
    cleanupExpiredSessions();
    let quizMap = getUserQuizzes(caller);
    let quiz = switch (quizMap.get(quizId)) {
      case (?q) { q };
      case (null) { Runtime.trap("Quiz not found") };
    };
    let id = nextSessionId;
    nextSessionId += 1;
    let session : Session = {
      id;
      quizId;
      hostPrincipal = caller;
      roomPin = pin;
      status = #lobby;
      players = Map.empty<Nat, PlayerData>();
      isLocked = false;
      autoAdvance = false;
      currentQuestionIndex = 0;
      currentPhase = #lobby;
      phaseStartTime = Time.now();
      questions = quiz.questions;
      lastHostHeartbeat = Time.now();
      nextPlayerId = 0;
    };
    sessions.add(id, session);
    roomPinIndex.add(pin, id);
    { sessionId = id; roomPin = pin };
  };

  public query func checkRoomPin(roomPin : Text) : async Bool {
    roomPinIndex.get(roomPin) != null;
  };

  public shared func joinSession(roomPin : Text, displayName : Text) : async JoinResult {
    if (displayName == "") {
      Runtime.trap("Display name cannot be empty");
    };
    if (displayName.size() > 50) {
      Runtime.trap("Display name must be 50 characters or fewer");
    };
    // Generate token before validation so the await yield happens first,
    // ensuring all validation + mutation below runs atomically
    let token = await generatePlayerToken();
    let sessionId = switch (roomPinIndex.get(roomPin)) {
      case (?id) { id };
      case (null) { Runtime.trap("Invalid room PIN") };
    };
    let session = getSession(sessionId);
    switch (session.status) {
      case (#lobby) {};
      case (#active) { Runtime.trap("Game has already started") };
      case (#ended) { Runtime.trap("Session has ended") };
    };
    if (session.isLocked) {
      Runtime.trap("Session is locked");
    };
    if (session.players.size() >= 50) {
      Runtime.trap("Session is full (max 50 players)");
    };
    // Throttle rapid joins to prevent automated session stuffing
    let now = Time.now();
    switch (lastJoinTime.get(sessionId)) {
      case (?last) {
        if (now - last < JOIN_COOLDOWN_NS) {
          Runtime.trap("Too many join attempts — please try again");
        };
      };
      case (null) {};
    };
    if (isNameTaken(session, displayName, null)) {
      Runtime.trap("Display name is already taken in this session");
    };
    lastJoinTime.add(sessionId, now);
    let playerId = session.nextPlayerId;
    let avatarIndex = cosmeticRandom() % 24;
    let player : PlayerData = {
      token;
      playerId;
      displayName;
      avatarIndex;
      score = 0;
      currentStreak = 0;
      answers = Map.empty<Nat, PlayerAnswer>();
      joinedAt = Time.now();
    };
    session.players.add(token, player);
    // Increment nextPlayerId on the session
    let updatedSession : Session = {
      id = session.id;
      quizId = session.quizId;
      hostPrincipal = session.hostPrincipal;
      roomPin = session.roomPin;
      status = session.status;
      players = session.players;
      isLocked = session.isLocked;
      autoAdvance = session.autoAdvance;
      currentQuestionIndex = session.currentQuestionIndex;
      currentPhase = session.currentPhase;
      phaseStartTime = session.phaseStartTime;
      questions = session.questions;
      lastHostHeartbeat = session.lastHostHeartbeat;
      nextPlayerId = playerId + 1;
    };
    sessions.add(session.id, updatedSession);
    { playerToken = token; playerId; sessionId; avatarIndex };
  };

  public query ({ caller }) func getSessionState(sessionId : Nat) : async SessionStateResponse {
    requireAuth(caller);
    let session = getSession(sessionId);
    requireHost(caller, session);
    let questionData : ?HostQuestionData = if (session.currentQuestionIndex < session.questions.size()) {
      let q = session.questions[session.currentQuestionIndex];
      ?{
        questionType = q.questionType;
        text = q.text;
        options = q.options;
        correctOptionIndices = q.correctOptionIndices;
        timeLimit = q.timeLimit;
        pointMode = q.pointMode;
        acceptedAnswers = q.acceptedAnswers;
        sliderMin = q.sliderMin;
        sliderMax = q.sliderMax;
        sliderCorrect = q.sliderCorrect;
        image = q.image;
        imagePlacement = q.imagePlacement;
        theme = q.theme;
        showQuestionToPlayers = q.showQuestionToPlayers;
      };
    } else {
      null;
    };
    {
      sessionId = session.id;
      roomPin = session.roomPin;
      status = session.status;
      currentPhase = session.currentPhase;
      currentQuestionIndex = session.currentQuestionIndex;
      isLocked = session.isLocked;
      autoAdvance = session.autoAdvance;
      playerCount = session.players.size();
      players = getPublicPlayers(session);
      phaseStartTime = session.phaseStartTime;
      questionCount = session.questions.size();
      currentQuestion = questionData;
      answerCount = getAnswerCount(session);
    };
  };

  public query func getPlayerState(roomPin : Text, playerToken : Nat) : async PlayerStateResponse {
    let session = getSessionByPin(roomPin);
    let player = getPlayerByToken(session, playerToken);
    let questionData : ?PlayerQuestionData = if (session.currentQuestionIndex < session.questions.size()) {
      let q = session.questions[session.currentQuestionIndex];
      ?{
        questionType = q.questionType;
        text = if (q.showQuestionToPlayers) { q.text } else { "" };
        options = q.options;
        timeLimit = q.timeLimit;
        sliderMin = q.sliderMin;
        sliderMax = q.sliderMax;
        image = q.image;
        imagePlacement = q.imagePlacement;
        theme = q.theme;
        showQuestionToPlayers = q.showQuestionToPlayers;
      };
    } else {
      null;
    };
    let hasAnswered = player.answers.get(session.currentQuestionIndex) != null;
    // Show feedback for current question only — null if unanswered
    let feedbackAnswer = player.answers.get(session.currentQuestionIndex);
    {
      status = session.status;
      currentPhase = session.currentPhase;
      isLocked = session.isLocked;
      players = getPublicPlayers(session);
      playerCount = session.players.size();
      ownDisplayName = player.displayName;
      ownAvatarIndex = player.avatarIndex;
      ownScore = player.score;
      currentQuestionIndex = session.currentQuestionIndex;
      currentQuestion = questionData;
      phaseStartTime = session.phaseStartTime;
      hasAnsweredCurrent = hasAnswered;
      lastAnswerCorrect = switch (feedbackAnswer) {
        case (?a) { ?a.isCorrect };
        case (null) { null };
      };
      lastPointsEarned = switch (feedbackAnswer) {
        case (?a) { a.pointsEarned };
        case (null) { 0 };
      };
      currentStreak = player.currentStreak;
      lastHostHeartbeat = session.lastHostHeartbeat;
    };
  };

  public shared ({ caller }) func removePlayer(sessionId : Nat, playerId : Nat) : async () {
    requireAuth(caller);
    let session = getSession(sessionId);
    requireHost(caller, session);
    switch (session.status) {
      case (#ended) { Runtime.trap("Session has ended") };
      case (_) {};
    };
    let playerToken = getTokenByPlayerId(session, playerId);
    switch (session.players.get(playerToken)) {
      case (null) { Runtime.trap("Player not found") };
      case (?_) {
        session.players.remove(playerToken);
        // After removal during answering, check if all remaining players have answered
        switch (session.currentPhase) {
          case (#answering) {
            if (session.players.size() > 0 and getAnswerCount(session) == session.players.size()) {
              resetStreaksForNonAnswerers(session);
              replaceSession(session, { status = null; isLocked = null; currentPhase = ?(#results); phaseStartTime = ?(Time.now()); currentQuestionIndex = null; autoAdvance = null });
            };
          };
          case (_) {};
        };
      };
    };
  };

  public shared ({ caller }) func lockSession(sessionId : Nat, locked : Bool) : async () {
    requireAuth(caller);
    let session = getSession(sessionId);
    requireHost(caller, session);
    switch (session.status) {
      case (#lobby) {};
      case (_) { Runtime.trap("Can only lock/unlock during lobby") };
    };
    replaceSession(session, { status = null; isLocked = ?locked; currentPhase = null; phaseStartTime = null; currentQuestionIndex = null; autoAdvance = null });
  };

  public shared ({ caller }) func startGame(sessionId : Nat) : async () {
    requireAuth(caller);
    let session = getSession(sessionId);
    requireHost(caller, session);
    switch (session.status) {
      case (#lobby) {};
      case (_) { Runtime.trap("Can only start from lobby") };
    };
    if (session.players.size() == 0) {
      Runtime.trap("Cannot start with no players");
    };
    replaceSession(session, { status = ?(#active); isLocked = ?true; currentPhase = ?(#questionDisplay); phaseStartTime = ?(Time.now()); currentQuestionIndex = null; autoAdvance = null });
  };

  public shared func updatePlayerName(roomPin : Text, playerToken : Nat, newName : Text) : async () {
    if (newName == "") {
      Runtime.trap("Display name cannot be empty");
    };
    if (newName.size() > 50) {
      Runtime.trap("Display name must be 50 characters or fewer");
    };
    let session = getSessionByPin(roomPin);
    switch (session.status) {
      case (#lobby) {};
      case (_) { Runtime.trap("Can only update name during lobby") };
    };
    let player = getPlayerByToken(session, playerToken);
    if (isNameTaken(session, newName, ?playerToken)) {
      Runtime.trap("Display name is already taken in this session");
    };
    session.players.add(
      playerToken,
      {
        token = player.token;
        playerId = player.playerId;
        displayName = newName;
        avatarIndex = player.avatarIndex;
        score = player.score;
        currentStreak = player.currentStreak;
        answers = player.answers;
        joinedAt = player.joinedAt;
      },
    );
  };

  public shared ({ caller }) func advancePhase(sessionId : Nat) : async () {
    requireAuth(caller);
    let session = getSession(sessionId);
    requireHost(caller, session);
    switch (session.status) {
      case (#active) {};
      case (_) { Runtime.trap("Game is not active") };
    };
    let now = Time.now();
    switch (session.currentPhase) {
      case (#questionDisplay) {
        replaceSession(session, { status = null; isLocked = null; currentPhase = ?(#answering); phaseStartTime = ?(now); currentQuestionIndex = null; autoAdvance = null });
      };
      case (#answering) {
        resetStreaksForNonAnswerers(session);
        replaceSession(session, { status = null; isLocked = null; currentPhase = ?(#results); phaseStartTime = ?(now); currentQuestionIndex = null; autoAdvance = null });
      };
      case (#results) {
        replaceSession(session, { status = null; isLocked = null; currentPhase = ?(#scoreboard); phaseStartTime = ?(now); currentQuestionIndex = null; autoAdvance = null });
      };
      case (#scoreboard) {
        let nextIndex = session.currentQuestionIndex + 1;
        if (nextIndex >= session.questions.size()) {
          replaceSession(session, { status = null; isLocked = null; currentPhase = ?(#podium); phaseStartTime = ?(now); currentQuestionIndex = null; autoAdvance = null });
        } else {
          replaceSession(session, { status = null; isLocked = null; currentPhase = ?(#questionDisplay); phaseStartTime = ?(now); currentQuestionIndex = ?(nextIndex); autoAdvance = null });
        };
      };
      case (#podium) {
        archiveSession(session);
        replaceSession(session, { status = ?(#ended); isLocked = null; currentPhase = ?(#ended); phaseStartTime = ?(now); currentQuestionIndex = null; autoAdvance = null });
        roomPinIndex.remove(session.roomPin);
      };
      case (_) {
        Runtime.trap("Cannot advance from current phase");
      };
    };
  };

  public shared func submitAnswer(roomPin : Text, playerToken : Nat, answer : AnswerSubmission) : async () {
    let session = getSessionByPin(roomPin);
    switch (session.status) {
      case (#active) {};
      case (_) { Runtime.trap("Game is not active") };
    };
    switch (session.currentPhase) {
      case (#answering) {};
      case (_) { Runtime.trap("Not in answering phase") };
    };
    let player = getPlayerByToken(session, playerToken);
    let qIndex = session.currentQuestionIndex;
    if (player.answers.get(qIndex) != null) {
      Runtime.trap("Already answered this question");
    };
    let question = getCurrentQuestion(session);
    let now = Time.now();
    let timeLimitNs = question.timeLimit * 1_000_000_000;
    if (now > session.phaseStartTime + timeLimitNs) {
      Runtime.trap("Time is up");
    };

    // Validate and check correctness based on question type
    var isCorrect = false;
    var selectedOptions : [Nat] = [];
    var textAnswer : Text = "";
    var sliderValue : Nat = 0;

    switch (question.questionType) {
      case (#quiz or #trueFalse) {
        switch (answer) {
          case (#options(opts)) {
            for (opt in opts.vals()) {
              if (opt >= question.options.size()) {
                Runtime.trap("Selected option index out of range");
              };
            };
            if (opts.size() == 0) {
              Runtime.trap("Must select at least one option");
            };
            selectedOptions := opts;
            isCorrect := checkCorrectness(opts, question.correctOptionIndices);
          };
          case (_) {
            Runtime.trap("Quiz/TrueFalse questions require option selection");
          };
        };
      };
      case (#typeAnswer) {
        switch (answer) {
          case (#text(txt)) {
            if (txt == "") {
              Runtime.trap("Answer cannot be empty");
            };
            if (txt.size() > MAX_OPTION_TEXT_LENGTH) {
              Runtime.trap("Answer must be " # MAX_OPTION_TEXT_LENGTH.toText() # " characters or fewer");
            };
            textAnswer := txt;
            let lowerTxt = toLower(txt);
            for (accepted in question.acceptedAnswers.vals()) {
              if (toLower(accepted) == lowerTxt) {
                isCorrect := true;
              };
            };
          };
          case (_) {
            Runtime.trap("Type Answer questions require a text answer");
          };
        };
      };
      case (#slider) {
        switch (answer) {
          case (#slider(val)) {
            if (val < question.sliderMin or val > question.sliderMax) {
              Runtime.trap("Slider value out of range");
            };
            sliderValue := val;
            isCorrect := val == question.sliderCorrect;
          };
          case (_) { Runtime.trap("Slider questions require a slider value") };
        };
      };
    };

    let points = if (isCorrect) {
      computeScore(question, now, session.phaseStartTime);
    } else {
      0;
    };
    let newStreak = if (isCorrect) {
      player.currentStreak + 1;
    } else {
      0;
    };
    let playerAnswer : PlayerAnswer = {
      selectedOptions;
      textAnswer;
      sliderValue;
      submittedAt = now;
      isCorrect;
      pointsEarned = points;
    };
    let updatedAnswers = player.answers;
    updatedAnswers.add(qIndex, playerAnswer);
    updatePlayerData(
      session,
      playerToken,
      {
        token = player.token;
        playerId = player.playerId;
        displayName = player.displayName;
        avatarIndex = player.avatarIndex;
        score = player.score + points;
        currentStreak = newStreak;
        answers = updatedAnswers;
        joinedAt = player.joinedAt;
      },
    );

    // Auto-advance to results when all players have answered
    if (getAnswerCount(session) == session.players.size()) {
      replaceSession(session, { status = null; isLocked = null; currentPhase = ?(#results); phaseStartTime = ?(Time.now()); currentQuestionIndex = null; autoAdvance = null });
    };
  };

  public shared ({ caller }) func setAutoAdvance(sessionId : Nat, enabled : Bool) : async () {
    requireAuth(caller);
    let session = getSession(sessionId);
    requireHost(caller, session);
    replaceSession(session, { status = null; isLocked = null; currentPhase = null; phaseStartTime = null; currentQuestionIndex = null; autoAdvance = ?(enabled) });
  };

  public shared ({ caller }) func hostHeartbeat(sessionId : Nat) : async () {
    requireAuth(caller);
    let session = getSession(sessionId);
    requireHost(caller, session);
    let now = Time.now();
    switch (session.status) {
      case (#ended) {};
      case (_) {
        // Auto-advance from answering to results when timer expires
        switch (session.currentPhase) {
          case (#answering) {
            let question = getCurrentQuestion(session);
            let timeLimitNs = question.timeLimit * 1_000_000_000;
            if (timeLimitNs > 0 and now > session.phaseStartTime + timeLimitNs) {
              resetStreaksForNonAnswerers(session);
              replaceSession(session, { status = null; isLocked = null; currentPhase = ?(#results); phaseStartTime = ?(now); currentQuestionIndex = null; autoAdvance = null });
              // Also update heartbeat on the new session state
              let updatedSession = getSession(sessionId);
              let hb : Session = {
                id = updatedSession.id;
                quizId = updatedSession.quizId;
                hostPrincipal = updatedSession.hostPrincipal;
                roomPin = updatedSession.roomPin;
                status = updatedSession.status;
                players = updatedSession.players;
                isLocked = updatedSession.isLocked;
                autoAdvance = updatedSession.autoAdvance;
                currentQuestionIndex = updatedSession.currentQuestionIndex;
                currentPhase = updatedSession.currentPhase;
                phaseStartTime = updatedSession.phaseStartTime;
                questions = updatedSession.questions;
                lastHostHeartbeat = now;
                nextPlayerId = updatedSession.nextPlayerId;
              };
              sessions.add(updatedSession.id, hb);
            } else {
              let updated : Session = {
                id = session.id;
                quizId = session.quizId;
                hostPrincipal = session.hostPrincipal;
                roomPin = session.roomPin;
                status = session.status;
                players = session.players;
                isLocked = session.isLocked;
                autoAdvance = session.autoAdvance;
                currentQuestionIndex = session.currentQuestionIndex;
                currentPhase = session.currentPhase;
                phaseStartTime = session.phaseStartTime;
                questions = session.questions;
                lastHostHeartbeat = now;
                nextPlayerId = session.nextPlayerId;
              };
              sessions.add(session.id, updated);
            };
          };
          case (_) {
            let updated : Session = {
              id = session.id;
              quizId = session.quizId;
              hostPrincipal = session.hostPrincipal;
              roomPin = session.roomPin;
              status = session.status;
              players = session.players;
              isLocked = session.isLocked;
              autoAdvance = session.autoAdvance;
              currentQuestionIndex = session.currentQuestionIndex;
              currentPhase = session.currentPhase;
              phaseStartTime = session.phaseStartTime;
              questions = session.questions;
              lastHostHeartbeat = now;
              nextPlayerId = session.nextPlayerId;
            };
            sessions.add(session.id, updated);
          };
        };
      };
    };
  };

  public query ({ caller }) func getQuestionResults(sessionId : Nat, questionIndex : Nat) : async QuestionResultsResponse {
    requireAuth(caller);
    let session = getSession(sessionId);
    requireHost(caller, session);
    if (questionIndex >= session.questions.size()) {
      Runtime.trap("Question index out of range");
    };
    buildQuestionResults(session, questionIndex);
  };

  public query ({ caller }) func getLeaderboard(sessionId : Nat) : async LeaderboardResponse {
    requireAuth(caller);
    let session = getSession(sessionId);
    requireHost(caller, session);
    buildLeaderboard(session);
  };

  public query ({ caller }) func getStreaks(sessionId : Nat) : async [StreakEntry] {
    requireAuth(caller);
    let session = getSession(sessionId);
    requireHost(caller, session);
    buildStreaks(session);
  };

  public query func getPlayerQuestionResults(roomPin : Text, playerToken : Nat, questionIndex : Nat) : async QuestionResultsResponse {
    let session = getSessionByPin(roomPin);
    ignore getPlayerByToken(session, playerToken);
    if (questionIndex >= session.questions.size()) {
      Runtime.trap("Question index out of range");
    };
    // Never allow results for future questions
    if (questionIndex > session.currentQuestionIndex) {
      Runtime.trap("Results not available yet for this question");
    };
    // For current question, only allow after answering is over
    if (questionIndex == session.currentQuestionIndex) {
      switch (session.currentPhase) {
        case (#results or #scoreboard or #podium or #ended) {};
        case (_) {
          Runtime.trap("Results not available yet for this question");
        };
      };
    };
    buildQuestionResults(session, questionIndex);
  };

  public query func getPlayerLeaderboard(roomPin : Text, playerToken : Nat) : async LeaderboardResponse {
    let session = getSessionByPin(roomPin);
    ignore getPlayerByToken(session, playerToken);
    buildLeaderboard(session);
  };

  public query func getPlayerStreaks(roomPin : Text, playerToken : Nat) : async [StreakEntry] {
    let session = getSessionByPin(roomPin);
    ignore getPlayerByToken(session, playerToken);
    buildStreaks(session);
  };

  public shared ({ caller }) func endSession(sessionId : Nat) : async () {
    requireAuth(caller);
    let session = getSession(sessionId);
    requireHost(caller, session);
    switch (session.status) {
      case (#ended) { Runtime.trap("Session already ended") };
      case (_) {};
    };
    // Only archive if game was actually played (not just lobby)
    switch (session.currentPhase) {
      case (#lobby) {};
      case (_) { archiveSession(session) };
    };
    replaceSession(session, { status = ?(#ended); isLocked = null; currentPhase = ?(#ended); phaseStartTime = ?(Time.now()); currentQuestionIndex = null; autoAdvance = null });
    roomPinIndex.remove(session.roomPin);
  };

  public query ({ caller }) func getPostGameSummary(sessionId : Nat) : async PostGameSummaryResponse {
    requireAuth(caller);
    let session = getSession(sessionId);
    requireHost(caller, session);
    buildPostGameSummary(session);
  };

  public query ({ caller }) func getReports() : async [ReportSummary] {
    requireAuth(caller);
    let reports = getUserReports(caller);
    let result = List.empty<ReportSummary>();
    for ((_, report) in reports.entries()) {
      result.add({
        id = report.id;
        quizTitle = report.quizTitle;
        playedAt = report.playedAt;
        playerCount = report.playerCount;
        questionCount = report.questionCount;
      });
    };
    result.sortInPlace(func(a, b) { Int.compare(b.playedAt, a.playedAt) });
    result.toArray();
  };

  public query ({ caller }) func getReport(reportId : Nat) : async ?Report {
    requireAuth(caller);
    let reports = getUserReports(caller);
    reports.get(reportId);
  };

  public shared ({ caller }) func deleteReport(reportId : Nat) : async () {
    requireAuth(caller);
    let reports = getUserReports(caller);
    switch (reports.get(reportId)) {
      case (?_) { reports.remove(reportId) };
      case (null) { Runtime.trap("Report not found") };
    };
  };
};
