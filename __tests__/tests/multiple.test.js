var getPostCssTreeFromSass =
    require('../../helpers/getPostCssTreeFromSassTree');

it('multiple.sass', function () {
    expect(getPostCssTreeFromSass('multiple')).toMatchSnapshot();
});
