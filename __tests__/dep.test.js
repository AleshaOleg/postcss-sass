test('require dart-sass', () => {
  let sass = require('../index');
  expect(typeof sass).toBe('object');
});