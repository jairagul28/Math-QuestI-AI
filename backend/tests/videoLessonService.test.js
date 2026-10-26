const test = require('node:test');
const assert = require('node:assert/strict');
const { topics } = require('../utils/seedData');
const { getFallbackLesson } = require('../utils/mathValidator');
const {
  VIDEO_LESSON_CONTENT_VERSION,
  createVideoSlides,
  hasValidVideoSlides,
} = require('../services/videoLessonService');

test('every seeded Grade 5 and Grade 6 topic has five topic-specific narrated fallback slides', () => {
  assert.equal(topics.length, 8);

  for (const topic of topics) {
    const lesson = getFallbackLesson(topic.slug);
    assert.ok(lesson, `Expected a verified fallback for ${topic.slug}`);
    assert.equal(lesson.grade, topic.grade);

    const slides = createVideoSlides(lesson, topic);
    assert.equal(slides.length, 5);
    assert.match(slides[0].title, new RegExp(topic.title));
    assert.match(slides[0].subtitle, new RegExp(topic.standardCode.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    assert.equal(slides[1].title, 'Core Concepts');
    assert.equal(slides[2].title, 'Worked Example');
    assert.equal(slides[3].title, 'Real-Life Application');
    assert.equal(slides[4].title, 'Summary and Practice');

    for (const slide of slides) {
      assert.equal(slide.narration, slide.content.join(' '));
      assert.ok(slide.content.every((line) => line.trim().length > 0));
    }
    assert.equal(hasValidVideoSlides(slides), true);

    if (topic.category !== 'Fractions') {
      assert.doesNotMatch(slides[0].title, /fraction/i);
      assert.doesNotMatch(slides[0].content.join(' '), /fraction adventure/i);
    }
  }
});

test('lesson cache uses a version that invalidates cached lessons without five narrated slides', () => {
  assert.equal(VIDEO_LESSON_CONTENT_VERSION, 1);
  assert.equal(hasValidVideoSlides([]), false);
  assert.equal(hasValidVideoSlides([{ title: 'One slide' }]), false);
});

test('seeded worked examples have their verified answers', () => {
  const expectedAnswers = {
    'grade5-fractions-unlike-denominators': ['11/12', '1/3'],
    'grade5-decimals-thousandths': ['4.728'],
    'grade5-geometry-properties': ['A rectangle (and a parallelogram)', '4 right angles'],
    'grade5-volume-prisms': ['24 cm³', '45 in³'],
    'grade6-ratios-rates': ['60 miles per hour'],
    'grade6-dividing-fractions': ['15/8 (or 1 7/8)'],
    'grade6-decimals-operations': ['3.6', '12'],
    'grade6-geometry-area-nets': ['52 cm²', '52 cm²'],
  };

  for (const topic of topics) {
    const lesson = getFallbackLesson(topic.slug);
    assert.deepEqual(
      lesson.workedExamples.map((example) => example.answer),
      expectedAnswers[topic.slug],
      `Unexpected worked example answer for ${topic.slug}`
    );
  }
});
