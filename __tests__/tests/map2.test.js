var getPostCssTreeFromSass = require('../../helpers/getPostCssTreeFromSassTree');

it('map2.sass', function () {
    expect(getPostCssTreeFromSass('map2')).toMatchSnapshot();
});
