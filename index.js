var fs = require('fs');

var postcss = require('postcss');
var gonzales = require('gonzales-pe');
var Input = require('postcss/lib/input');

var sassSource = fs.readFileSync('./__tests__/sass/basic.sass', 'utf-8');
var sassTree = gonzales.parse(sassSource, { syntax: 'sass' });
var cssSource = fs.readFileSync('./__tests__/css/basic.css', 'utf-8');
var postCssASTFromCss = postcss.parse(cssSource);

var DEFAULT_RAWS_ROOT = {
    semicolon: false,
    after: ''
};

var DEFAULT_RAWS_RULE = {
    before: '',
    between: ' ',
    semicolon: false,
    after: ''
};

var DEFAULT_RAWS_DECL = {
    before: '',
    between: ': '
};

/* eslint-disable complexity */
function sassToPostCss(node, parent, source, selector) {
    if (node.type === 'stylesheet') {
        // Create and set parameters for Root node
        var root = postcss.root();
        root.source = {
            start: node.start,
            end: node.end,
            source: new Input(source)
        };
        root.raws = DEFAULT_RAWS_ROOT;
        for (var i = 0; i < node.content.length; i++) {
            sassToPostCss(node.content[i], root, source, selector);
        }
        return root;
    } else if (node.type === 'ruleset') {
        // Loop to find the deepest ruleset node
        for (var rContent = 0; rContent < node.content.length; rContent++ ) {
            if (node.content[rContent].type === 'block') {
                for (
                    var bNextContent = 0;
                    bNextContent < node.content[rContent].length;
                    bNextContent++
                ) {
                    if (node.content[rContent]
                            .content[bNextContent].type === 'ruleset') {
                        // Add to selector value of current node
                        sassToPostCss(node.content[rContent]
                            .content[bNextContent], parent, source, selector);
                    }
                }
            }
            if (node.content[rContent].type === 'selector') {
                /* Get current selector name
                It's always have same path,
                so it's easier to get it without recursion */
                for (
                    var sCurrentContent = 0;
                    sCurrentContent < node.content[rContent].length;
                    sCurrentContent++
                ) {
                    if (node.content[rContent]
                            .content[sCurrentContent].type === 'id') {
                        selector += '#';
                    } else if (node.content[rContent]
                            .content[sCurrentContent].type === 'class') {
                        selector += '.';
                    }
                    selector += node.content[rContent]
                        .content[sCurrentContent].content;
                }
                selector += ' ';
            }
        }

        // Create Rule node
        var rule = postcss.rule();
        // Object to store raws for Rule
        var rRaws = {};

        // Looking for all block nodes in current ruleset node
        for (
            var rCurrentContent = 0;
            rCurrentContent < node.content.length;
            rCurrentContent++
        ) {
            if (node.content[rCurrentContent].type === 'block') {
                sassToPostCss(node.content[rCurrentContent], rule, source);
            } else if (node.content[rCurrentContent].type === 'space') {
                if (!rRaws.between) {
                    rRaws.between = node.content[rCurrentContent].content;
                } else {
                    rRaws.between += node.content[rCurrentContent].content;
                }
            }
        }
        if (rule.nodes.length !== 0) {
            // Write selector to Rule, and remove last whitespace
            rule.selector = selector.slice(0, -1);
            // Set parameters for Rule node
            rule.parent = parent;
            rule.source = {
                start: node.start,
                end: node.end,
                source: new Input(source)
            };
            if (Object.keys(rRaws).length > 0) {
                rule.raws = rRaws;
            } else {
                rule.raws = DEFAULT_RAWS_RULE;
            }
            parent.nodes.push(rule);
        }
    } else if (node.type === 'block') {
        // Looking for declaration node in block node
        for (var bContent = 0; bContent < node.content.length; bContent++) {
            if (node.content[bContent].type === 'declaration') {
                sassToPostCss(node.content[bContent], parent, source);
            }
        }
    } else if (node.type === 'declaration') {
        // Create Declaration node
        var decl = postcss.decl();
        // Object to store raws for Declaration
        var dRaws = {};
        // Looking for property and value node in declaration node
        for (var dContent = 0; dContent < node.content.length; dContent++) {
            if (node.content[dContent].type === 'property') {
                sassToPostCss(node.content[dContent], decl);
            } else if (node.content[dContent].type === 'propertyDelimiter') {
                if (!dRaws.between) {
                    dRaws.between = node.content[dContent].content;
                } else {
                    dRaws.between += node.content[dContent].content;
                }
            } else if (node.content[dContent].type === 'space') {
                if (!dRaws.between) {
                    dRaws.between = node.content[dContent].content;
                } else {
                    dRaws.between += node.content[dContent].content;
                }
            } if (node.content[dContent].type === 'value') {
                sassToPostCss(node.content[dContent], decl);
            }
        }
        // Set parameters for Declaration node
        decl.source = {
            start: node.start,
            end: node.end,
            source: new Input(source)
        };
        decl.parent = parent;
        if (Object.keys(dRaws) > 0) {
            dRaws.before = '';
            decl.raws = dRaws;
        } else {
            decl.raws = DEFAULT_RAWS_DECL;
        }
        parent.nodes.push(decl);
    } else if (node.type === 'property') {
        // Set property for Declaration node
        parent.prop = node.content[0].content;
    } else if (node.type === 'value') {
        // Set value for Declaration node
        parent.value = node.content[0].content;
    }
    return null;
}
/* eslint-enable complexity */

// Selector for current node
var selector = '';

var postCssASTFromSass = sassToPostCss(sassTree, null, sassSource, selector);
console.dir(postCssASTFromCss);
console.log('-----');
console.dir(postCssASTFromSass);

module.exports = sassToPostCss;
