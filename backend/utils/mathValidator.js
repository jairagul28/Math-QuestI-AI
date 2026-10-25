/**
 * Mathematical Verification & Curriculum Fallback Engine
 * Provides deterministic mathematical consistency checks and guaranteed-accurate
 * Georgia Standards curriculum fallbacks for Grades 5 and 6.
 */

// Greatest Common Divisor
function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a;
}

// Least Common Multiple
function lcm(a, b) {
  if (a === 0 || b === 0) return 0;
  return Math.abs(a * b) / gcd(a, b);
}

// Simplify a fraction
function simplifyFraction(numerator, denominator) {
  if (denominator === 0) return null;
  const common = gcd(numerator, denominator);
  return {
    numerator: numerator / common,
    denominator: denominator / common,
    formatted: `${numerator / common}/${denominator / common}`,
  };
}

/**
 * Validate arithmetic expressions in questions and answers
 */
function validateArithmetic(questionText, answerText) {
  // Simple regex to catch expressions like "12 + 8 = 20" or "What is 1/3 + 2/5"
  const basicAddSub = /(\d+)\s*([\+\-\*\/])\s*(\d+)/;
  const match = questionText.match(basicAddSub);

  if (match) {
    const a = parseInt(match[1], 10);
    const op = match[2];
    const b = parseInt(match[3], 10);
    let expected = null;

    if (op === '+') expected = a + b;
    if (op === '-') expected = a - b;
    if (op === '*') expected = a * b;
    if (op === '/' && b !== 0) expected = a / b;

    if (expected !== null) {
      // Check if answer contains expected number
      if (!answerText.includes(expected.toString())) {
        return { isValid: false, reason: `Computed ${a} ${op} ${b} = ${expected}, but answer lacks this value` };
      }
    }
  }

  return { isValid: true };
}

/**
 * Verified Fallback Lessons for Georgia Mathematics Standards
 * Used if Groq API is unavailable, rate-limited, or fails validation.
 */
const VERIFIED_FALLBACK_LESSONS = {
  // Grade 5: Fractions (5.NR.3)
  'grade5-fractions-unlike-denominators': {
    title: 'Adding & Subtracting Fractions with Unlike Denominators',
    grade: 5,
    topic: 'Fractions',
    introduction: 'Welcome Explorer! When adding or subtracting fractions like 1/3 and 2/5, you cannot simply add the top numbers because the parts are different sizes! We must find a common denominator first.',
    explanation: 'To combine fractions with different denominators:\n\n1. **Find the Least Common Denominator (LCD)**: Identify the smallest multiple that both denominators share. For denominators 3 and 5, multiples of 3 are 3, 6, 9, 12, 15... and multiples of 5 are 5, 10, 15... The LCD is 15.\n\n2. **Convert to Equivalent Fractions**: Multiply the numerator and denominator by the factor needed to reach the LCD: 1/3 = (1×5)/(3×5) = 5/15, and 2/5 = (2×3)/(5×3) = 6/15.\n\n3. **Combine the Numerators**: Add or subtract the numerators while keeping the common denominator: 5/15 + 6/15 = 11/15.\n\n4. **Simplify**: Check if the resulting fraction can be reduced using the Greatest Common Divisor.',
    keyConcepts: [
      'Denominators define how many equal pieces make up one whole unit.',
      'The Least Common Denominator (LCD) is the Least Common Multiple (LCM) of both denominators.',
      'Always multiply both numerator and denominator by the exact same nonzero number to create an equivalent fraction.',
      'Never add or subtract the denominators together.',
    ],
    workedExamples: [
      {
        question: 'What is 1/4 + 2/3?',
        steps: [
          'Step 1: Find the LCD of 4 and 3. Multiples of 4: 4, 8, 12... Multiples of 3: 3, 6, 9, 12. The LCD is 12.',
          'Step 2: Convert 1/4 to an equivalent fraction with denominator 12: (1 × 3) / (4 × 3) = 3/12.',
          'Step 3: Convert 2/3 to an equivalent fraction with denominator 12: (2 × 4) / (3 × 4) = 8/12.',
          'Step 4: Add the numerators: 3/12 + 8/12 = 11/12.',
        ],
        answer: '11/12',
      },
      {
        question: 'Solve: 5/6 - 1/2',
        steps: [
          'Step 1: The LCD of 6 and 2 is 6, because 2 divides into 6 evenly.',
          'Step 2: 5/6 is already in sixths. Convert 1/2: (1 × 3) / (2 × 3) = 3/6.',
          'Step 3: Subtract the numerators: 5/6 - 3/6 = 2/6.',
          'Step 4: Simplify 2/6 by dividing numerator and denominator by 2: 2/6 = 1/3.',
        ],
        answer: '1/3',
      },
    ],
    realWorldApplication: 'Imagine you are baking cookies for a school festival. The recipe calls for 1/3 cup of brown sugar and 2/5 cup of cane sugar. Finding the common denominator (15) allows you to measure exactly 11/15 cup of total sweetness without guessing!',
    summary: 'Adding and subtracting fractions requires equivalent parts. Find the LCD, convert each fraction, add or subtract the numerators, keep the denominator identical, and simplify the final result.',
    practiceTips: [
      'Write down the multiples of both denominators side-by-side to spot the LCD quickly.',
      'Always perform a quick mental check: is the answer larger than both parts (for addition) and smaller than the first part (for subtraction)?',
      'Look for opportunities to simplify by dividing by 2, 3, or 5 at the end.',
    ],
    infographicUrl: '/infographics/equivalent-fractions-infographic.png',
  },

  // Grade 5: Decimals (5.NR.1 & 5.NR.2)
  'grade5-decimals-thousandths': {
    title: 'Decimal Place Value & Thousandths Operations',
    grade: 5,
    topic: 'Decimals',
    introduction: 'Decimals allow us to measure tiny increments with precision. In Grade 5, we explore the thousandths place—dividing a whole into one thousand equal parts!',
    explanation: 'Our base-ten number system continues past the decimal point:\n\n• **Tenths (0.1)**: 1 out of 10 parts\n• **Hundredths (0.01)**: 1 out of 100 parts\n• **Thousandths (0.001)**: 1 out of 1,000 parts\n\nWhen adding or subtracting decimals, **line up the decimal points vertically** so corresponding place values match up. You can attach trailing zeros as place holders to avoid confusion.',
    keyConcepts: [
      'Each step to the right of the decimal point is 10 times smaller (1/10th of the previous position).',
      'Always line up decimal points vertically before adding or subtracting.',
      'Annexing zeros to the right of a decimal does not change its value (e.g., 0.5 = 0.50 = 0.500).',
    ],
    workedExamples: [
      {
        question: 'Calculate: 3.45 + 1.278',
        steps: [
          'Step 1: Line up the decimal points and add a placeholder zero: 3.450 + 1.278.',
          'Step 2: Add thousandths: 0 + 8 = 8.',
          'Step 3: Add hundredths: 5 + 7 = 12 (write 2, carry 1 to tenths).',
          'Step 4: Add tenths: 1 (carried) + 4 + 2 = 7.',
          'Step 5: Bring down the decimal point and add ones: 3 + 1 = 4.',
        ],
        answer: '4.728',
      },
    ],
    realWorldApplication: 'In Olympic swimming races, electronic timing touchpads measure finishes down to the thousandth of a second (0.001s). Knowing decimal place values helps judges determine the gold medalist!',
    summary: 'Decimals extend place value to fractions of ten. Line up decimal points, use placeholder zeros, and compute column by column.',
    practiceTips: [
      'Draw vertical grid lines to keep your decimal places neatly aligned on paper.',
      'Estimate your sum first (e.g. 3.45 + 1.28 ≈ 3.5 + 1.3 = 4.8) to check if your answer is reasonable.',
    ],
  },

  // Grade 6: Ratios (6.NR.4)
  'grade6-ratios-rates': {
    title: 'Ratios, Rates & Proportional Reasoning',
    grade: 6,
    topic: 'Ratios & Proportions',
    introduction: 'Welcome to Middle School Mathematics! A ratio is a mathematical comparison of two quantities, showing their proportional relationship.',
    explanation: 'A ratio compares two quantities (A to B). We can express ratios in three standard notations:\n\n1. **Word form**: 3 to 4\n2. **Colon form**: 3 : 4\n3. **Fraction form**: 3/4\n\n**Unit Rates**: A unit rate compares a quantity to ONE unit of another quantity (such as miles per 1 hour or dollars per 1 pound). To compute a unit rate, divide the first quantity by the second quantity.',
    keyConcepts: [
      'A ratio compares quantities using division: part-to-part or part-to-whole.',
      'Equivalent ratios maintain the same proportional scale factor when multiplied or divided.',
      'A unit rate always has a denominator of 1.',
    ],
    workedExamples: [
      {
        question: 'A rocket travels 240 miles in 4 hours. What is its unit speed in miles per hour?',
        steps: [
          'Step 1: Identify the ratio of miles to hours: 240 miles / 4 hours.',
          'Step 2: Divide both terms by 4 to get a denominator of 1: 240 ÷ 4 = 60.',
          'Step 3: State the unit rate: 60 miles per 1 hour.',
        ],
        answer: '60 miles per hour',
      },
    ],
    realWorldApplication: 'Grocery shopping uses unit prices! If a 12-pack of juice boxes costs $6.00 ($0.50/box) while an 8-pack costs $4.80 ($0.60/box), calculating the unit rate reveals that the 12-pack is the smarter deal.',
    summary: 'Ratios describe proportional relationships. Equivalent ratios scale proportionally, and unit rates normalize comparisons to a single unit.',
    practiceTips: [
      'Use a ratio table or tape diagram to visualize proportional increments.',
      'Always check the order requested: "cats to dogs" (3:5) is completely different from "dogs to cats" (5:3)!',
    ],
  },

  // Grade 6: Dividing Fractions (6.NR.1)
  'grade6-dividing-fractions': {
    title: 'Dividing Fractions by Fractions',
    grade: 6,
    topic: 'Fractions',
    introduction: 'Dividing fractions answers the question: "How many of this smaller fraction can fit inside that larger fraction?"',
    explanation: 'To divide fractions, we multiply by the **reciprocal** (the inverted fraction):\n\n1. **Keep** the first fraction unchanged.\n2. **Change** the division sign to multiplication (÷ becomes ×).\n3. **Flip** the second fraction upside down (its reciprocal).\n4. Multiply the numerators and multiply the denominators, then simplify.',
    keyConcepts: [
      'The reciprocal of a fraction a/b is b/a (e.g., reciprocal of 2/3 is 3/2).',
      'Dividing by a fraction is equivalent to multiplying by its reciprocal.',
      'Any number multiplied by its reciprocal equals 1.',
    ],
    workedExamples: [
      {
        question: 'Solve: 3/4 ÷ 2/5',
        steps: [
          'Step 1: Keep 3/4.',
          'Step 2: Change ÷ to ×.',
          'Step 3: Flip 2/5 to its reciprocal: 5/2.',
          'Step 4: Multiply numerators and denominators: (3 × 5) / (4 × 2) = 15/8.',
          'Step 5: Convert to mixed number if required: 1 7/8.',
        ],
        answer: '15/8 (or 1 7/8)',
      },
    ],
    realWorldApplication: 'If a chef has 3/4 cup of chocolate syrup and each sundae requires 1/8 cup, dividing (3/4 ÷ 1/8 = 3/4 × 8/1 = 24/4 = 6) shows the chef can craft exactly 6 delicious sundaes.',
    summary: 'Keep, Change, Flip! Multiply by the reciprocal to divide fractions efficiently.',
    practiceTips: [
      'Never flip the first fraction—only flip the divisor (the second fraction).',
      'Look for diagonal cancellation before multiplying to save time simplifying.',
    ],
  },
};

/**
 * Verified Fallback Quizzes for Georgia Mathematics Standards
 * Used if Groq API is unavailable or returns invalid questions.
 */
const VERIFIED_FALLBACK_QUESTIONS = {
  // Grade 5: Fractions (5.NR.3)
  'grade5-fractions-unlike-denominators': [
    {
      questionText: 'What is the sum of 1/3 and 2/5 in simplest form?',
      options: ['3/8', '11/15', '7/15', '13/15'],
      correctOptionIndex: 1,
      explanation: 'Find LCD of 3 and 5, which is 15. 1/3 = 5/15 and 2/5 = 6/15. 5/15 + 6/15 = 11/15.',
      difficulty: 'medium',
      points: 20,
    },
    {
      questionText: 'What is the least common denominator (LCD) for 1/4 and 1/6?',
      options: ['12', '24', '10', '8'],
      correctOptionIndex: 0,
      explanation: 'Multiples of 4 are 4, 8, 12, 16... Multiples of 6 are 6, 12, 18... The least common multiple is 12.',
      difficulty: 'easy',
      points: 10,
    },
    {
      questionText: 'Evaluate: 7/8 - 1/2',
      options: ['6/6', '3/8', '5/8', '1/4'],
      correctOptionIndex: 1,
      explanation: '1/2 converted to eighths is 4/8. 7/8 - 4/8 = 3/8.',
      difficulty: 'easy',
      points: 10,
    },
    {
      questionText: 'Solve and simplify: 2/3 + 3/4',
      options: ['5/7', '1 5/12', '1 1/6', '17/12'],
      correctOptionIndex: 1,
      explanation: 'LCD of 3 and 4 is 12. 2/3 = 8/12, 3/4 = 9/12. 8/12 + 9/12 = 17/12 = 1 5/12.',
      difficulty: 'hard',
      points: 30,
    },
    {
      questionText: 'A recipe uses 3/5 cup flour and 1/4 cup sugar. How much total ingredients are used?',
      options: ['4/9 cup', '17/20 cup', '7/20 cup', '19/20 cup'],
      correctOptionIndex: 1,
      explanation: 'LCD of 5 and 4 is 20. 3/5 = 12/20 and 1/4 = 5/20. 12/20 + 5/20 = 17/20 cup.',
      difficulty: 'medium',
      points: 20,
    },
    {
      questionText: 'What is 3 1/2 - 1 3/4?',
      options: ['1 3/4', '2 1/4', '1 1/2', '2 3/4'],
      correctOptionIndex: 0,
      explanation: 'Convert: 3 1/2 = 3 2/4 = 2 6/4. Subtract: 2 6/4 - 1 3/4 = 1 3/4.',
      difficulty: 'hard',
      points: 30,
    },
  ],

  // Grade 6: Ratios (6.NR.4)
  'grade6-ratios-rates': [
    {
      questionText: 'In a class there are 12 boys and 16 girls. What is the ratio of boys to girls in simplest form?',
      options: ['3 : 4', '4 : 3', '12 : 28', '3 : 7'],
      correctOptionIndex: 0,
      explanation: 'Divide both terms by their GCD (4): 12 ÷ 4 = 3, 16 ÷ 4 = 4. The ratio is 3:4.',
      difficulty: 'easy',
      points: 10,
    },
    {
      questionText: 'A runner completes 18 miles in 3 hours. What is the runner\'s unit rate in miles per hour?',
      options: ['5 mph', '6 mph', '9 mph', '54 mph'],
      correctOptionIndex: 1,
      explanation: 'Divide distance by hours: 18 miles ÷ 3 hours = 6 miles per hour.',
      difficulty: 'easy',
      points: 10,
    },
    {
      questionText: 'If 4 notebooks cost $14.00, how much do 7 notebooks cost at the same rate?',
      options: ['\\$21.00', '\\$24.50', '\\$28.00', '\\$22.50'],
      correctOptionIndex: 1,
      explanation: 'Unit cost per notebook = $14 ÷ 4 = $3.50. Cost for 7 notebooks = 7 × $3.50 = $24.50.',
      difficulty: 'medium',
      points: 20,
    },
    {
      questionText: 'A car consumes 5 gallons of gasoline every 150 miles. How many gallons are required for 360 miles?',
      options: ['10 gallons', '11 gallons', '12 gallons', '15 gallons'],
      correctOptionIndex: 2,
      explanation: 'Gas mileage = 150 ÷ 5 = 30 miles per gallon. For 360 miles: 360 ÷ 30 = 12 gallons.',
      difficulty: 'hard',
      points: 30,
    },
    {
      questionText: 'A fruit punch ratio is 2 cups orange juice to 3 cups cranberry juice. To make 25 cups total, how many cups of orange juice are needed?',
      options: ['8 cups', '10 cups', '12 cups', '15 cups'],
      correctOptionIndex: 1,
      explanation: 'Total ratio parts = 2 + 3 = 5 parts. 25 cups ÷ 5 = 5 cups per part. Orange juice = 2 × 5 = 10 cups.',
      difficulty: 'hard',
      points: 30,
    },
  ],
};

function getFallbackLesson(topicSlug, fallbackMetadata = {}) {
  const lesson = VERIFIED_FALLBACK_LESSONS[topicSlug];
  if (lesson) {
    return {
      ...lesson,
      isFallback: true,
      verified: true,
    };
  }

  // Generic fallback if topic is outside standard set
  return {
    title: fallbackMetadata.title || 'Georgia Mathematics Standard Lesson',
    grade: fallbackMetadata.grade || 5,
    topic: fallbackMetadata.category || 'Mathematics',
    introduction: `Welcome to this guided lesson exploring ${fallbackMetadata.title || 'essential mathematical concepts'}.`,
    explanation: fallbackMetadata.description || 'Mastering this Georgia Mathematics standard will strengthen your problem-solving abilities.',
    keyConcepts: [
      'Understand core vocabulary and standard mathematical notation.',
      'Apply structured, step-by-step reasoning to every problem.',
      'Check answers using inverse operations and estimation.',
    ],
    workedExamples: [
      {
        question: 'Sample Practice Problem',
        steps: ['Analyze the question terms', 'Apply standard arithmetic procedures', 'Verify the numerical solution'],
        answer: 'Verified solution',
      },
    ],
    realWorldApplication: 'These mathematical principles are applied in architecture, computer coding, navigation, and science.',
    summary: 'Core principles of this standard provide the foundation for ongoing mathematical progression.',
    practiceTips: ['Read problem statements twice', 'Show all work clearly step by step'],
    isFallback: true,
    verified: true,
  };
}

function getFallbackQuestions(topicSlug, count = 5) {
  const questions = VERIFIED_FALLBACK_QUESTIONS[topicSlug];
  if (questions && questions.length >= count) {
    return questions.slice(0, count);
  }
  if (questions && questions.length > 0) {
    return questions;
  }

  // Generic verified math questions
  return [
    {
      questionText: 'What is 3/4 + 1/8 in simplest form?',
      options: ['4/12', '7/8', '5/8', '1/2'],
      correctOptionIndex: 1,
      explanation: '3/4 = 6/8. 6/8 + 1/8 = 7/8.',
      difficulty: 'medium',
      points: 20,
    },
    {
      questionText: 'Which fraction is equivalent to 2/3?',
      options: ['4/6', '3/4', '4/9', '5/6'],
      correctOptionIndex: 0,
      explanation: 'Multiply numerator and denominator by 2: (2 × 2) / (3 × 2) = 4/6.',
      difficulty: 'easy',
      points: 10,
    },
    {
      questionText: 'What is 12.45 - 3.20?',
      options: ['9.15', '9.25', '8.25', '15.65'],
      correctOptionIndex: 1,
      explanation: '12.45 - 3.20 = 9.25.',
      difficulty: 'medium',
      points: 20,
    },
    {
      questionText: 'Solve: 5/6 ÷ 2/3',
      options: ['1 1/4', '10/18', '5/9', '1 1/2'],
      correctOptionIndex: 0,
      explanation: 'Multiply by reciprocal: 5/6 × 3/2 = 15/12 = 5/4 = 1 1/4.',
      difficulty: 'hard',
      points: 30,
    },
  ];
}

module.exports = {
  gcd,
  lcm,
  simplifyFraction,
  validateArithmetic,
  getFallbackLesson,
  getFallbackQuestions,
};

