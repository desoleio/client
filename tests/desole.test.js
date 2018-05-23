/* global test, describe, test, expect */

const underTest = require('../src/desole')

describe('Desole', function () {
  'use strict';

  test('should export a function', () => {
    expect(typeof underTest).toBe('function');
  });
});
