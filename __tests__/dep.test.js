test('require gonzales-pe', () => {
  var gonzales = require('../index');
  expect(typeof gonzales).toBe('object');
});