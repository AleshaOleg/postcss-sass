var getPostCssTreeFromSass = require('../../helpers/getPostCssTreeFromSassTree');

it('list1comment.sass', function () {
    expect(getPostCssTreeFromSass('list1comment')).toMatchSnapshot();
});
