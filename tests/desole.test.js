'use strict';
const underTest = require('../src/desole');

describe('Desole', function () {
	test('should export a function', () => {
		expect(typeof underTest).toBe('function');
	});
});
