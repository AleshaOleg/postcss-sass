var getPostCssTreeFromSass = require('../../helpers/getPostCssTreeFromSass');

it('basic.sass', function () {
    expect(getPostCssTreeFromSass('basic')).toMatchSnapshot();
});
