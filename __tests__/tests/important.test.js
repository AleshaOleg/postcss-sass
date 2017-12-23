const getPostCssTreeFromSass = require('../../helpers/getPostCssTreeFromSassTree');

it('important.sass', function () {
    expect(getPostCssTreeFromSass('important')).toMatchSnapshot();
});
