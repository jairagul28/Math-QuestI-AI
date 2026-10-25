const { z } = require('zod');

// Schema for Phase 2 Lesson Generation
const workedExampleSchema = z.object({
  question: z.string().min(5, 'Question must be at least 5 characters'),
  steps: z.array(z.string().min(3)).min(1, 'At least one step required'),
  answer: z.string().min(1, 'Answer is required'),
});

const lessonGenerationSchema = z.object({
  title: z.string().min(3, 'Title is too short'),
  grade: z.union([z.literal(5), z.literal(6)]),
  topic: z.string().min(2),
  introduction: z.string().min(10, 'Introduction must be informative'),
  explanation: z.string().min(30, 'Explanation must be comprehensive'),
  keyConcepts: z.array(z.string().min(3)).min(2, 'At least 2 key concepts required'),
  workedExamples: z.array(workedExampleSchema).min(1, 'At least 1 worked example required'),
  realWorldApplication: z.string().min(10, 'Real world application required'),
  summary: z.string().min(10, 'Summary required'),
  practiceTips: z.array(z.string().min(3)).min(1, 'At least 1 practice tip required'),
});

// Schema for Phase 3 Quiz Question Generation
const quizQuestionSchema = z.object({
  questionText: z.string().min(8, 'Question text too short'),
  options: z.array(z.string().min(1)).length(4, 'Must have exactly 4 answer options'),
  correctOptionIndex: z.number().int().min(0).max(3, 'Correct index must be 0, 1, 2, or 3'),
  explanation: z.string().min(10, 'Explanation required'),
  hint: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  topic: z.string().optional(),
  grade: z.union([z.literal(5), z.literal(6)]).optional(),
}).refine((data) => {
  // Check no duplicate options
  const unique = new Set(data.options.map((opt) => opt.trim().toLowerCase()));
  return unique.size === 4;
}, {
  message: 'All 4 options must be distinct without duplicate values',
});

const quizGenerationSchema = z.object({
  topicId: z.string().optional(),
  topicTitle: z.string().optional(),
  grade: z.union([z.literal(5), z.literal(6)]),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  questions: z.array(quizQuestionSchema).min(1),
});

module.exports = {
  lessonGenerationSchema,
  quizQuestionSchema,
  quizGenerationSchema,
};

