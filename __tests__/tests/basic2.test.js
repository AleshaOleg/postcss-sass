var getPostCssTreeFromSass = require('../../helpers/getPostCssTreeFromSassTree');

it('basic2.sass', function () {
    expect(getPostCssTreeFromSass('basic2')).toMatchSnapshot();
});
