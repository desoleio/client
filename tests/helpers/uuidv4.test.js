/* global test, describe, test, expect */

const underTest = require('../../src/helpers/uuidv4');

describe('uuidv4', function () {
  'use strict';

  test('should export a function', () => {
    expect(typeof underTest).toBe('function');
  });

  test('should generate valid uuid v4', () => {
    const uuidv4_regex = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;

    expect(uuidv4_regex.test(underTest())).toBeTruthy();
  });

  test('should generate different values when it is executed multiple times', () => {
    expect(underTest()).not.toBe(underTest());
  });
});
