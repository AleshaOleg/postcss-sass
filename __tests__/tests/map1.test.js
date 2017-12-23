const getPostCssTreeFromSass = require('../../helpers/getPostCssTreeFromSassTree');

it('map1.sass', function () {
    expect(getPostCssTreeFromSass('map1')).toMatchSnapshot();
});
