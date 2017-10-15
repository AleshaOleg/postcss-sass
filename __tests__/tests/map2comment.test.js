var getPostCssTreeFromSass = require('../../helpers/getPostCssTreeFromSassTree');

it('map2comment.sass', function () {
    expect(getPostCssTreeFromSass('map2comment')).toMatchSnapshot();
});
