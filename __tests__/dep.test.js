test('require dart-sass', () => {
  var sass = require('../index');
  expect(typeof sass).toBe('object');
});