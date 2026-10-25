function hashSeed(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function createRandom(seed) {
  let state = seed || 1;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function createQuestion(questionText, answer, explanation, random) {
  const offsets = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const distractors = [];
  while (distractors.length < 3) {
    const offset = offsets.splice(Math.floor(random() * offsets.length), 1)[0];
    const wrongAnswer = answer + (distractors.length % 2 === 0 ? offset : -offset);
    if (wrongAnswer >= 0 && wrongAnswer !== answer && !distractors.includes(wrongAnswer)) {
      distractors.push(wrongAnswer);
    }
  }
  const options = [answer, ...distractors];
  for (let index = options.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [options[index], options[swapIndex]] = [options[swapIndex], options[index]];
  }
  return {
    questionText,
    options: options.map(String),
    correctOptionIndex: options.indexOf(answer),
    expectedAnswer: String(answer),
    explanation,
  };
}

function createOptionQuestion(questionText, answer, wrongAnswers, explanation, random) {
  const options = [String(answer), ...wrongAnswers.map(String)];
  for (let index = options.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [options[index], options[swapIndex]] = [options[swapIndex], options[index]];
  }
  return {
    questionText,
    options,
    correctOptionIndex: options.indexOf(String(answer)),
    expectedAnswer: String(answer),
    explanation,
  };
}

function makeArithmeticQuestion(index, random, grade, standard) {
  const first = 10 + Math.floor(random() * (grade === 5 ? 40 : 90));
  const second = 2 + Math.floor(random() * (grade === 5 ? 18 : 30));
  const operation = index % 3;
  if (operation === 0) {
    return createQuestion(
      `A math explorer finds ${first} gems, then ${second} more. How many gems are there altogether?`,
      first + second,
      `${first} + ${second} = ${first + second}.`,
      random
    );
  }
  if (operation === 1) {
    return createQuestion(
      `A collection has ${first + second} cards. ${second} are traded away. How many remain?`,
      first,
      `${first + second} - ${second} = ${first}.`,
      random
    );
  }
  const groups = 2 + Math.floor(random() * 8);
  const groupSize = 2 + Math.floor(random() * 12);
  return createQuestion(
    `There are ${groups} equal groups with ${groupSize} items in each group. How many items are there?`,
    groups * groupSize,
    `${groups} × ${groupSize} = ${groups * groupSize}.`,
    random
  );
}

function makeSpotlightQuestion(index, random, topic, grade) {
  const category = topic?.category || 'Fractions';
  if (category === 'Fractions') {
    const denominator = [4, 5, 6, 8, 10][Math.floor(random() * 5)];
    const first = 1 + Math.floor(random() * Math.max(1, denominator - 2));
    const second = 1 + Math.floor(random() * Math.max(1, denominator - first));
    const answer = `${first + second}/${denominator}`;
    const wrongAnswers = [
      `${Math.abs(first - second)}/${denominator}`,
      `${first + second}/${denominator + 1}`,
      `${first + second + 1}/${denominator}`,
    ];
    return createOptionQuestion(
      `What is ${first}/${denominator} + ${second}/${denominator}?`,
      answer,
      wrongAnswers,
      `The denominators match, so add the numerators: ${first} + ${second} = ${first + second}. The answer is ${answer}.`,
      random
    );
  }

  if (category === 'Decimals') {
    const firstCents = 100 + Math.floor(random() * 900);
    const secondCents = 10 + Math.floor(random() * 400);
    const answer = ((firstCents + secondCents) / 100).toFixed(2);
    const first = (firstCents / 100).toFixed(2);
    const second = (secondCents / 100).toFixed(2);
    return createOptionQuestion(
      `What is ${first} + ${second}?`,
      answer,
      [
        ((firstCents + secondCents + 10) / 100).toFixed(2),
        ((firstCents + secondCents - 10) / 100).toFixed(2),
        ((firstCents + secondCents + 100) / 100).toFixed(2),
      ],
      `${first} + ${second} = ${answer}.`,
      random
    );
  }

  if (category === 'Ratios & Proportions') {
    const firstPart = 2 + Math.floor(random() * 5);
    const secondPart = 2 + Math.floor(random() * 5);
    const scale = 2 + Math.floor(random() * 6);
    const total = (firstPart + secondPart) * scale;
    const answer = firstPart * scale;
    return createQuestion(
      `A recipe uses a ${firstPart}:${secondPart} ratio of juice to water. If there are ${total} cups altogether, how many cups are juice?`,
      answer,
      `There are ${firstPart + secondPart} total ratio parts. ${total} ÷ ${firstPart + secondPart} = ${scale} cups per part, so juice is ${firstPart} × ${scale} = ${answer} cups.`,
      random
    );
  }

  if (category === 'Geometry') {
    const length = 4 + Math.floor(random() * 12);
    const width = 3 + Math.floor(random() * 9);
    const answer = index % 2 === 0 ? 2 * (length + width) : length * width;
    const operation = index % 2 === 0 ? 'perimeter' : 'area';
    return createQuestion(
      `A rectangle is ${length} units long and ${width} units wide. What is its ${operation}?`,
      answer,
      operation === 'perimeter'
        ? `Perimeter = 2 × (${length} + ${width}) = ${answer} units.`
        : `Area = ${length} × ${width} = ${answer} square units.`,
      random
    );
  }

  return makeArithmeticQuestion(index, random, grade, topic?.standardCode);
}

function buildDailyChallenges(challengeDate, grade, topics = []) {
  const topic = topics.length
    ? topics[hashSeed(`${challengeDate}:${grade}:standard`) % topics.length]
    : null;
  const standardCode = topic?.standardCode || (grade === 5 ? '5.NR.3' : '6.NR.4');
  const quickRandom = createRandom(hashSeed(`${challengeDate}:${grade}:quick`));
  const standardRandom = createRandom(hashSeed(`${challengeDate}:${grade}:standard-questions`));
  const bossRandom = createRandom(hashSeed(`${challengeDate}:${grade}:boss`));
  const quickQuestions = Array.from({ length: 5 }, (_, index) =>
    makeArithmeticQuestion(index, quickRandom, grade, standardCode)
  );
  const spotlightQuestions = Array.from({ length: 5 }, (_, index) =>
    makeSpotlightQuestion(index, standardRandom, topic, grade)
  );

  const packs = 2 + Math.floor(bossRandom() * 8);
  const itemsPerPack = 4 + Math.floor(bossRandom() * 9);
  const donated = 1 + Math.floor(bossRandom() * (itemsPerPack - 1));
  const bossAnswer = packs * itemsPerPack - donated;
  const boss = createQuestion(
    `A school club has ${packs} packs with ${itemsPerPack} pencils in each pack. After donating ${donated} pencils, how many are left?`,
    bossAnswer,
    `First multiply ${packs} × ${itemsPerPack} = ${packs * itemsPerPack}. Then subtract ${donated}: ${packs * itemsPerPack} - ${donated} = ${bossAnswer}.`,
    bossRandom
  );

  return [
    {
      code: 'quick-fire',
      title: 'Quick Fire',
      description: 'Solve five speedy math questions.',
      standardCode,
      durationSeconds: 180,
      rewardXP: 30,
      questions: quickQuestions,
    },
    {
      code: 'standard-spotlight',
      title: 'Standard Spotlight',
      description: `Practice skills aligned to ${standardCode}.`,
      standardCode,
      durationSeconds: 0,
      rewardXP: 35,
      questions: spotlightQuestions,
    },
    {
      code: 'boss-quest',
      title: 'Boss Quest',
      description: 'Solve a multi-step word problem.',
      standardCode,
      durationSeconds: 0,
      rewardXP: 50,
      questions: [boss],
    },
  ];
}

function verifyChallengeQuestions(challenges) {
  return challenges.every((challenge) =>
    challenge.questions.every((question) => (
      question.options.length === 4
      && new Set(question.options).size === 4
      && Number.isInteger(question.correctOptionIndex)
      && question.correctOptionIndex >= 0
      && question.correctOptionIndex < 4
      && question.options[question.correctOptionIndex] === question.expectedAnswer
    ))
  );
}

module.exports = { buildDailyChallenges, verifyChallengeQuestions };
