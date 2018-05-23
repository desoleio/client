/* global test, describe, test, expect */

const underTest = require('../../src/helpers/uuidv4');

describe('uuidv4', function () {
  'use strict';

  test('should export a function', () => {
    expect(typeof underTest).toBe('function');
  });
});
