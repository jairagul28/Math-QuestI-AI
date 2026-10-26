const { z } = require('zod');

const VIDEO_LESSON_CONTENT_VERSION = 1;

const videoSlideSchema = z.object({
  title: z.string().min(3),
  subtitle: z.string().min(3),
  content: z.array(z.string().min(3)).min(1),
  narration: z.string().min(10),
});

const videoSlidesSchema = z.array(videoSlideSchema).length(5);

function createVideoSlides(lesson, topic) {
  const workedExamples = lesson.workedExamples || [];
  const workedExample = workedExamples[0];
  const practiceExample = workedExamples[1] || workedExample;

  if (!workedExample || !practiceExample) {
    throw new Error(`Lesson for topic '${topic.slug}' must include a worked example.`);
  }

  const standard = `${topic.standardCode} • Grade ${topic.grade}`;
  const slideContent = [
    {
      title: `Introduction: ${topic.title}`,
      subtitle: standard,
      content: [lesson.introduction],
    },
    {
      title: 'Core Concepts',
      subtitle: `Key ideas for ${topic.title}`,
      content: [lesson.explanation, ...(lesson.keyConcepts || [])],
    },
    {
      title: 'Worked Example',
      subtitle: workedExample.question,
      content: [...workedExample.steps, `Answer: ${workedExample.answer}`],
    },
    {
      title: 'Real-Life Application',
      subtitle: `Where we use ${topic.category.toLowerCase()}`,
      content: [lesson.realWorldApplication],
    },
    {
      title: 'Summary and Practice',
      subtitle: 'Review the idea, then try a problem',
      content: [
        lesson.summary,
        `Practice question: ${practiceExample.question}`,
        ...practiceExample.steps,
        `Solution: ${practiceExample.answer}`,
      ],
    },
  ].map((slide) => ({
    ...slide,
    content: slide.content.filter((line) => typeof line === 'string' && line.trim()),
    narration: slide.content.filter((line) => typeof line === 'string' && line.trim()).join(' '),
  }));

  return videoSlidesSchema.parse(slideContent);
}

function hasValidVideoSlides(slides) {
  return videoSlidesSchema.safeParse(slides).success;
}

module.exports = {
  VIDEO_LESSON_CONTENT_VERSION,
  createVideoSlides,
  hasValidVideoSlides,
};
