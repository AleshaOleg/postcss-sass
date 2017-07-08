var getPostCssTreeFromSass =
    require('../../helpers/getPostCssTreeFromSassTree');

it('alt.sass', function () {
    expect(getPostCssTreeFromSass('alt')).toMatchSnapshot();
});
