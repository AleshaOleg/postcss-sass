var getPostCssTreeFromSass = require('../../helpers/getPostCssTreeFromSassTree');

it('variables.sass', function () {
    expect(getPostCssTreeFromSass('variables')).toMatchSnapshot();
});
