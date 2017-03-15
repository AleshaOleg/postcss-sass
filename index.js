var postcss = require('postcss');
var gonzales = require('gonzales-pe');
var Input = require('postcss/lib/input');

var sassSource = 'div\n  a\n    span\n      color: red\n  li\n    color: green';
var sassTree = gonzales.parse(sassSource, { syntax: 'sass' });
var postCssTree = postcss
    .parse('div a span { color : red; } div li { color : green; }');

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
function process(node, parent, source, selector) {
    if (node.type === 'stylesheet') {
        // Create and set parameters for Root node
        var root = postcss.root();
        root.source = {
            start: node.start,
            end: node.end,
            source: new Input(source)
        };
        root.raws = DEFAULT_RAWS_ROOT;
        process(node.content[0], root, source, selector);
        // Return PostCSS AST
        return root;
    } else if (node.type === 'ruleset') {
        var last = false;
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
                        last = true;
                        // Add to selector value of current node
                        process(node.content[rContent]
                            .content[bNextContent], parent, source, selector);
                    }
                }
            }
            if (node.content[rContent].type === 'selector') {
                /* Get current selector name
                It's always have same path,
                so it's easier to get it without recursion */
                selector += node.content[rContent]
                    .content[0].content[0].content + ' ';
            }
        }

        if (!last) {
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
                    process(node.content[rCurrentContent], rule, source);
                } else if (node.content[rCurrentContent].type === 'space') {
                    if (!rRaws.between) {
                        rRaws.between = node.content[rCurrentContent].content;
                    } else {
                        rRaws.between += node.content[rCurrentContent].content;
                    }
                }
            }
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
                process(node.content[bContent], parent, source);
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
                process(node.content[dContent], decl);
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
                process(node.content[dContent], decl);
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

var postCssAST = process(sassTree, null, sassSource, selector);
console.log(postCssAST);
// console.log('-----');
console.log(postCssTree);
