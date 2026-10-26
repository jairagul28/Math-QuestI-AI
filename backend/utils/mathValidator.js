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

  // Grade 5: Classifying 2D Shapes (5.GSR.8)
  'grade5-geometry-properties': {
    title: 'Classifying 2D Shapes & Geometric Properties',
    grade: 5,
    topic: 'Geometry',
    introduction: 'Polygons are closed, flat shapes made from straight line segments. We can sort them by counting sides and checking their angles and parallel sides.',
    explanation: 'A quadrilateral has four sides. Some quadrilaterals have special properties: a parallelogram has two pairs of parallel sides, a rectangle has four right angles, and a square has four equal sides and four right angles. A square is also a rectangle and a parallelogram because it has those properties. Triangles can be classified by their sides or angles.',
    keyConcepts: [
      'A polygon is a closed two-dimensional shape with straight sides.',
      'A rectangle has four right angles; a square is a rectangle with four equal sides.',
      'Classify shapes using all their properties, not just how they look or are turned.',
    ],
    workedExamples: [
      {
        question: 'A quadrilateral has four right angles and opposite sides parallel. What special shape is it?',
        steps: [
          'Step 1: It has four sides, so it is a quadrilateral.',
          'Step 2: Four right angles match the defining property of a rectangle.',
          'Step 3: Opposite sides are parallel, so it is also a parallelogram.',
        ],
        answer: 'A rectangle (and a parallelogram)',
      },
      {
        question: 'A square has side lengths of 4 cm. How many right angles does it have?',
        steps: [
          'Step 1: A square has four sides of equal length.',
          'Step 2: Every square also has four right angles.',
        ],
        answer: '4 right angles',
      },
    ],
    realWorldApplication: 'Builders inspect the parallel sides and right angles of floor tiles and window frames to check that the pieces fit together neatly.',
    summary: 'Polygons are classified by their sides, angles, and parallel lines. A shape can belong to more than one group when it has all of their properties.',
    practiceTips: [
      'Count sides and look for right angles or parallel sides before naming a polygon.',
      'Check whether a shape fits inside a larger shape family, such as a square also being a rectangle.',
    ],
  },

  // Grade 5: Volume of Rectangular Prisms (5.GSR.7)
  'grade5-volume-prisms': {
    title: 'Volume of Rectangular Prisms',
    grade: 5,
    topic: 'Geometry',
    introduction: 'Volume tells how much three-dimensional space a solid figure fills. We can measure a rectangular prism by counting the unit cubes that fit inside it.',
    explanation: 'For a rectangular prism, volume equals length times width times height: V = l × w × h. The base layer contains length × width unit cubes, and the height tells how many equal layers there are. Volume is measured in cubic units, such as cm³.',
    keyConcepts: [
      'Volume measures space inside a three-dimensional object.',
      'For a rectangular prism, V = length × width × height.',
      'Use cubic units for volume; do not confuse volume with surface area.',
    ],
    workedExamples: [
      {
        question: 'Find the volume of a rectangular prism that is 4 cm long, 3 cm wide, and 2 cm high.',
        steps: [
          'Step 1: Find the base layer: 4 × 3 = 12 unit cubes.',
          'Step 2: There are 2 equal layers, so multiply 12 × 2 = 24.',
          'Step 3: Label the volume in cubic centimeters.',
        ],
        answer: '24 cm³',
      },
      {
        question: 'A box has a base area of 15 square inches and is 3 inches high. What is its volume?',
        steps: [
          'Step 1: Use volume = base area × height.',
          'Step 2: Multiply 15 × 3 = 45.',
        ],
        answer: '45 in³',
      },
    ],
    realWorldApplication: 'A shipping company uses volume to estimate how much space a package takes up and whether it will fit inside a delivery truck.',
    summary: 'Multiply the three side lengths of a rectangular prism to find its volume. The answer uses cubic units because it measures three-dimensional space.',
    practiceTips: [
      'Write the three dimensions and multiply them in any order.',
      'Check that your answer is in cubic units, such as cm³ or in³.',
    ],
  },

  // Grade 6: Multi-Digit Decimal Operations (6.NR.2)
  'grade6-decimals-operations': {
    title: 'Fluency with Multi-Digit Decimals',
    grade: 6,
    topic: 'Decimals',
    introduction: 'Decimals let us work precisely with amounts between whole numbers. In Grade 6, we use all four operations with multi-digit decimals and check that our answers make sense.',
    explanation: 'For addition and subtraction, line up decimal points. For multiplication, multiply as with whole numbers, then place the decimal so the product has the total number of decimal places in the factors. For division, move the decimal point the same number of places in both numbers to make the divisor a whole number.',
    keyConcepts: [
      'Align decimal points when adding or subtracting.',
      'A product has as many decimal places as the two factors have altogether.',
      'To divide by a decimal, shift both decimal points equally so the divisor becomes a whole number.',
    ],
    workedExamples: [
      {
        question: 'Multiply 2.4 × 1.5.',
        steps: [
          'Step 1: Multiply as whole numbers: 24 × 15 = 360.',
          'Step 2: There are two decimal places in the factors altogether.',
          'Step 3: Place the decimal two places from the right: 3.60.',
        ],
        answer: '3.6',
      },
      {
        question: 'Divide 8.4 by 0.7.',
        steps: [
          'Step 1: Move both decimal points one place right: 8.4 ÷ 0.7 becomes 84 ÷ 7.',
          'Step 2: Divide 84 by 7.',
        ],
        answer: '12',
      },
    ],
    realWorldApplication: 'When shopping, you might multiply the price per kilogram by a decimal number of kilograms, then subtract the total from your budget.',
    summary: 'Use place value carefully for every decimal operation. Estimate first and use inverse operations to check your result.',
    practiceTips: [
      'Estimate the answer before calculating to catch misplaced decimal points.',
      'For division, move both decimal points the same number of places.',
    ],
  },

  // Grade 6: Polygon Area and Surface Area (6.GSR.5)
  'grade6-geometry-area-nets': {
    title: 'Area of Polygons & Surface Area of 3D Nets',
    grade: 6,
    topic: 'Geometry',
    introduction: 'Complex shapes can be split into familiar shapes to find their area. A net unfolds a three-dimensional object into flat faces that we can measure.',
    explanation: 'The area of a triangle is A = 1/2 × base × height. A rectangle uses A = length × width. To find the area of a composite polygon, decompose it into shapes, find each area, and add them. Surface area is the total area of all outside faces; a net shows each face without overlap.',
    keyConcepts: [
      'Triangle area is one-half times its base times its perpendicular height.',
      'Find a composite polygon area by adding the areas of non-overlapping parts.',
      'Surface area is the sum of the areas of every face shown in a three-dimensional net.',
    ],
    workedExamples: [
      {
        question: 'A composite shape is made from a rectangle 8 cm by 5 cm and a triangle with base 6 cm and height 4 cm. Find its area.',
        steps: [
          'Step 1: Rectangle area = 8 × 5 = 40 cm².',
          'Step 2: Triangle area = 1/2 × 6 × 4 = 12 cm².',
          'Step 3: Add the non-overlapping areas: 40 + 12 = 52 cm².',
        ],
        answer: '52 cm²',
      },
      {
        question: 'Find the surface area of a rectangular prism with side lengths 4 cm, 3 cm, and 2 cm.',
        steps: [
          'Step 1: The three pairs of face areas are 4 × 3 = 12, 4 × 2 = 8, and 3 × 2 = 6 cm².',
          'Step 2: Add each pair: 2 × (12 + 8 + 6) = 52 cm².',
        ],
        answer: '52 cm²',
      },
    ],
    realWorldApplication: 'An architect can use a net to calculate how much cardboard is needed to make a box, or use polygon areas to plan a floor.',
    summary: 'Break polygons into familiar parts to find area. For surface area, add the area of every face in the solid’s net.',
    practiceTips: [
      'Draw and label each part of a composite shape before calculating.',
      'Use square units for area and make sure the triangle height is perpendicular to its base.',
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

function getFallbackLesson(topicSlug) {
  const lesson = VERIFIED_FALLBACK_LESSONS[topicSlug];
  if (lesson) {
    return {
      ...lesson,
      isFallback: true,
      verified: true,
    };
  }

  return null;
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
