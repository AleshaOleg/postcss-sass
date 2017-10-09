var getPostCssTreeFromSass = require('../../helpers/getPostCssTreeFromSassTree');

it('comments.sass', function () {
    expect(getPostCssTreeFromSass('comments')).toMatchSnapshot();
});
