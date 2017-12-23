const getPostCssTreeFromSass = require('../../helpers/getPostCssTreeFromSassTree');

it('basic.sass', function () {
    expect(getPostCssTreeFromSass('basic')).toMatchSnapshot();
});
