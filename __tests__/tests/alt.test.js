var getPostCssTreeFromSass = require('../../helpers/getPostCssTreeFromSass');

it('alt.sass', function () {
    expect(getPostCssTreeFromSass('alt')).toMatchSnapshot();
});
