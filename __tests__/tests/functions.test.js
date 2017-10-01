var getPostCssTreeFromSass =
    require('../../helpers/getPostCssTreeFromSassTree');

it('functions.sass', function () {
    expect(getPostCssTreeFromSass('functions')).toMatchSnapshot();
});
