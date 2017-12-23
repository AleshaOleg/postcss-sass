const getPostCssTreeFromSass = require('../../helpers/getPostCssTreeFromSassTree');

it('little.sass', function () {
    expect(getPostCssTreeFromSass('little')).toMatchSnapshot();
});
