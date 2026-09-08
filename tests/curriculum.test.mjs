import test from 'node:test';
import assert from 'node:assert/strict';
import { chapters, lessons } from '../curriculum/lessons.mjs';

test('curriculum contains 10 chapters and 40 lessons', () => {
  assert.equal(chapters.length, 10);
  assert.equal(lessons.length, 40);
});

test('lesson metadata has stable ids and chapter indexes', () => {
  lessons.forEach((lesson, index) => {
    const chapter = Math.floor(index / 4) + 1;
    const withinChapter = index % 4 + 1;
    assert.match(lesson.id, new RegExp(`^${String(chapter).padStart(2, '0')}-${String(withinChapter).padStart(2, '0')}$`));
    assert.equal(lesson.chapterIndex, chapter - 1);
    assert.equal(lesson.index, withinChapter - 1);
    assert.ok(lesson.title && lesson.concept && lesson.example && lesson.task);
  });
});

test('every lesson has complete test contracts, hints, and matching requirements', () => {
  for (const lesson of lessons) {
    assert.ok(Array.isArray(lesson.tests) && lesson.tests.length > 0, lesson.id);
    assert.ok(Array.isArray(lesson.hints) && lesson.hints.length > 0, lesson.id);
    assert.deepEqual(lesson.requirements, lesson.tests.map((item) => item.name), lesson.id);
    for (const item of lesson.tests) {
      assert.equal(typeof item.name, 'string', lesson.id);
      assert.ok(item.name.length > 0, lesson.id);
      assert.equal(typeof item.expression, 'string', lesson.id);
      assert.ok(item.expression.trim().length > 0, lesson.id);
      assert.notEqual(item.expected, undefined, lesson.id);
    }
  }
});

test('solutions and starters are package main exercises without learner main', () => {
  for (const lesson of lessons) {
    for (const field of ['starter', 'solution']) {
      assert.match(lesson[field], /^package main\b/, `${lesson.id} ${field}`);
      assert.doesNotMatch(lesson[field], /\bfunc\s+main\s*\(/, `${lesson.id} ${field}`);
    }
  }
});
