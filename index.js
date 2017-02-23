var postcss = require('postcss');
var gonzales = require('gonzales-pe');

var sass = 'div\n  a\n    color: red\n  li\n    color: green';
var sassTree = gonzales.parse(sass, { syntax: 'sass' });
var postCssTree = postcss
    .parse('div a { color: red; } div li { color: green; }');

var DEFAULT_RAWS_ROOT = {
    semicolon: false,
    after: ''
};

var DEFAULT_RAWS_RULE = {
    before: '',
    between: ' ',
    semicolon: true,
    after: ''
};

var DEFAULT_RAWS_DECL = {
    before: '',
    between: ': '
};

/* eslint-disable complexity */
function process(node, parent, selector) {
    if (node.type === 'stylesheet') {
        var root = postcss.root();
        root.source = {
            start: node.start
        };
        root.raws = DEFAULT_RAWS_ROOT;
        process(node.content[0], root, selector);
        return root;
    } else if (node.type === 'ruleset') {
        var last = true;
        for (var rContent = 0; rContent < node.content.length; rContent++ ) {
            if (node.content[rContent].type === 'block') {
                for (var j = 0; j < node.content[rContent].length; j++) {
                    if (node.content[rContent].content[j].type === 'ruleset') {
                        last = false;
                        process(node.content[rContent]
                            .content[j], parent, selector);
                    }
                }
            }
            if (node.content[rContent].type === 'selector') {
                selector += node.content[rContent]
                    .content[0].content[0].content + ' ';
            }
        }

        if (last) {
            var rule = postcss.rule();

            for (var i = 0; i < node.content.length; i++) {
                if (node.content[i].type === 'block') {
                    process(node.content[i], rule);
                }
            }

            rule.selector = selector.slice(0, -1);
            rule.parent = parent;
            rule.source = {
                start: node.start,
                end: node.end
            };
            rule.raws = DEFAULT_RAWS_RULE;
            parent.nodes.push(rule);
        }
    } else if (node.type === 'block') {
        for (var bContent = 0; bContent < node.content.length; bContent++) {
            if (node.content[bContent].type === 'declaration') {
                process(node.content[bContent], parent);
            }
            if (node.content[bContent].type === 'ruleset') {
                process(node.content[bContent], parent);
            }
        }
    } else if (node.type === 'declaration') {
        var decl = postcss.decl();
        for (var dContent = 0; dContent < node.content.length; dContent++) {
            if (node.content[dContent].type === 'property') {
                process(node.content[dContent], decl);
            }
            if (node.content[dContent].type === 'value') {
                process(node.content[dContent], decl);
            }
        }
        decl.source = {
            start: node.start,
            end: node.end
        };
        decl.parent = parent;
        decl.raws = DEFAULT_RAWS_DECL;
        parent.nodes.push(decl);
    } else if (node.type === 'property') {
        parent.prop = node.content[0].content;
    } else if (node.type === 'value') {
        parent.value = node.content[0].content;
    }
    return null;
}
/* eslint-enable complexity */

var selector = '';

var postCssAST = process(sassTree, null, selector);
console.log(postCssAST);
console.log(postCssTree);
