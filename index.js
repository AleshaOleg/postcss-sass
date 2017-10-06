const postcss = require('postcss');
const gonzales = require('gonzales-pe');
const Input = require('postcss/lib/input');

const DEFAULT_RAWS_ROOT = {
    before: ''
};

const DEFAULT_RAWS_RULE = {
    before: '',
    between: ''
};

const DEFAULT_RAWS_DECL = {
    before: '',
    between: '',
    semicolon: false
};

const DEFAULT_COMMENT_DECL = {
    before: '',
    left: '',
    right: ''
};

function sum(arg1, arg2) {
    return arg1 + arg2;
}

global.postcssSass = {};

function process(source, node, parent, input) {
    function bindedProcess(innerNode, innerParent) {
        return process(source, innerNode, innerParent || parent, input);
    }

    switch (node.type) {
        case 'stylesheet': {
            // Create and set parameters for Root node
            const root = postcss.root();
            root.source = {
                start: node.start,
                end: node.end,
                input: input
            };
            // Raws for root node
            root.raws = {
                semicolon: DEFAULT_RAWS_ROOT.semicolon,
                before: DEFAULT_RAWS_ROOT.before
            };
            // Store spaces before root (if exist)
            global.postcssSass.before = '';
            node.content.forEach(contentNode => bindedProcess(contentNode, root));
            return root;
        }
        case 'ruleset': {
            // Loop to find the deepest ruleset node
            var pseudoClassFirst = false;
            // Define new selector
            var selector = '';
            global.postcssSass.multiRuleProp = '';
            node.content.forEach(contentNode => {
                switch (contentNode.type) {
                    case 'block': {
                        // Create Rule node
                        var rule = postcss.rule();

                        // Object to store raws for Rule
                        var rRaws = {
                            before: global.postcssSass.before ||
                            DEFAULT_RAWS_RULE.before,
                            between: DEFAULT_RAWS_RULE.between
                        };

                        /* Variable to store spaces and symbols
						 before declaration property */
                        global.postcssSass.before = '';

                        global.postcssSass.comment = false;

                        // Look up throw all nodes in current ruleset node
                        node.content
                            .filter(({ type }) => type === 'block')
                            .forEach(innerContentNode => bindedProcess(innerContentNode, rule));

                        if (rule.nodes.length !== 0) {
                            // Write selector to Rule, and remove last whitespace
                            rule.selector = selector;
                            // Set parameters for Rule node
                            rule.parent = parent;
                            rule.source = {
                                start: node.start,
                                end: node.end,
                                input: input
                            };
                            rule.raws = rRaws;
                            parent.nodes.push(rule);
                        }
                        break;
                    }
                    case 'selector': {
                        // Creates selector for rule
                        contentNode.content.forEach((innerContentNode, i, nodes) => {
                            switch (innerContentNode.type) {
                                case 'id': {
                                    selector += '#';
                                    break;
                                }
                                case 'class': {
                                    selector += '.';
                                    break;
                                }
                                case 'typeSelector': {
                                    if (pseudoClassFirst && nodes[i + 1] && nodes[i + 1].type === 'pseudoClass') {
                                        selector += ', ';
                                    } else {
                                        pseudoClassFirst = true;
                                    }
                                    break;
                                }
                                case 'pseudoClass': {
                                    selector += ':';
                                    break;
                                }
                                default:
                            }
                            selector += innerContentNode.content;
                        });
                        break;
                    }
                    default:
                }
            });
            break;
        }
        case 'block': {
            /* If nested rules exist,
			wrap current rule in new rule node */
            if (global.postcssSass.multiRule) {
                var multiRule = postcss.rule();
                multiRule.source = {
                    start: {
                        line: node.start.line - 1,
                        column: node.start.column
                    },
                    end: node.end,
                    input: input
                };
                multiRule.parent = parent;
                multiRule.selector = global.postcssSass.multiRuleProp;
                multiRule.raws = {
                    before: global.postcssSass.before || DEFAULT_RAWS_RULE.before,
                    between: DEFAULT_RAWS_RULE.between
                };
                parent.push(multiRule);
                parent = multiRule;
            }

            global.postcssSass.before = '';

            // Looking for declaration node in block node
            node.content.forEach(contentNode => bindedProcess(contentNode));
            break;
        }
        case 'declaration': {
            var isBlockInside = false;
            // Create Declaration node
            var decl = postcss.decl();
            decl.prop = '';
            // Object to store raws for Declaration
            var dRaws = {
                before: global.postcssSass.before || DEFAULT_RAWS_DECL.before,
                between: DEFAULT_RAWS_DECL.between,
                semicolon: DEFAULT_RAWS_DECL.semicolon
            };

            global.postcssSass.property = false;
            global.postcssSass.betweenBefore = false;
            global.postcssSass.comment = false;
            // Looking for property and value node in declaration node
            node.content.forEach((contentNode) => {
                switch (contentNode.type) {
                    case 'property': {
                        /* global.property to detect is property is
						already defined in current object */
                        global.postcssSass.property = true;
                        global.postcssSass.multiRuleProp = contentNode.content[0].content;
                        bindedProcess(contentNode, decl);
                        break;
                    }
                    case 'propertyDelimiter': {
                        if (global.postcssSass.property && !global.postcssSass.betweenBefore) {
                            /* If property is already defined and there's no ':' before it */
                            dRaws.between += contentNode.content;
                            global.postcssSass.multiRuleProp += contentNode.content;
                        } else {
                            /* If ':' goes before property declaration, like :width 100px */
                            global.postcssSass.betweenBefore = true;
                            dRaws.before += contentNode.content;
                            global.postcssSass.multiRuleProp += contentNode.content;
                        }
                        break;
                    }
                    case 'space': {
                        dRaws.between += contentNode.content;
                        break;
                    }
                    case 'value': {
                        // Look up for a value for current property
                        switch (contentNode.content[0].type) {
                            case 'block': {
                                isBlockInside = true;
                                // If nested rules exist
                                if (typeof contentNode.content[0].content === 'object') {
                                    global.postcssSass.multiRule = true;
                                }
                                bindedProcess(contentNode.content[0]);
                                break;
                            }
                            case 'variable': {
                                decl.value = '$';
                                bindedProcess(contentNode, decl);
                                break;
                            }
                            case 'color': {
                                decl.value = '#';
                                bindedProcess(contentNode, decl);
                                break;
                            }
                            case 'number': {
                                if (contentNode.content.length > 1) {
                                    decl.value = contentNode.content.reduce(sum, '');
                                } else {
                                    bindedProcess(contentNode, decl);
                                }
                                break;
                            }
                            case 'parentheses': {
                                decl.value = '(';
                                bindedProcess(contentNode, decl);
                                break;
                            }
                            default: {
                                bindedProcess(contentNode, decl);
                            }
                        }
                        break;
                    }
                    default:
                }
            });

            global.postcssSass.before = '';

            if (!isBlockInside) {
                // Set parameters for Declaration node
                decl.source = {
                    start: node.start,
                    end: node.end,
                    input: input
                };
                decl.parent = parent;
                decl.raws = dRaws;
                parent.nodes.push(decl);
            }
            break;
        }
        case 'property': {
            // Set property for Declaration node
            if (node.content[0].type === 'variable') {
                parent.prop += '$';
            }
            parent.prop += node.content[0].content;
            break;
        }
        case 'value': {
            if (!parent.value) {
                parent.value = '';
            }
            // Set value for Declaration node
            if (node.content.length > 0) {
                node.content.forEach(contentNode => {
                    switch (contentNode.type) {
                        case 'important': {
                            parent.important = true;
                            break;
                        }
                        case 'parentheses': {
                            parent.value += contentNode.content.reduce(sum, '') + ')';
                            break;
                        }
                        default: {
                            if (contentNode.content.constructor === Array) {
                                parent.value += contentNode.content.reduce(sum, '');
                            } else {
                                parent.value += contentNode.content;
                            }
                        }
                    }
                });
            } else if (node.content[0].content.constructor === Array) { // NPE ???
                parent.value += node.content[0].content.reduce(sum, '');
            } else {
                parent.value += node.content[0].content;
            }
            break;
        }
        case 'singlelineComment':
        case 'multilineComment': {
            // Create a new node for comment
            var comment = postcss.comment();
            var text = node.content;
            // Clear comment text from spaces/symbols
            var textClear = text.trim();
            comment.text = textClear;
            // Found spaces/symbols before comment
            var left = text.search(/\S/);
            global.postcssSass.comment = true;
            // Found spaces/symbols after comment
            var right = text.length - textClear.length - left;
            // Raws for current comment node
            comment.raws = {
                before: global.postcssSass.before || DEFAULT_COMMENT_DECL.before,
                left: new Array(left + 1).join(' '),
                right: new Array(right + 1).join(' '),
                commentType: node.type === 'singlelineComment' ? 'single' : 'multi'
            };

            parent.nodes.push(comment);
            break;
        }
        case 'space': {
            // Spaces before root and rule
            switch (parent.type) {
                case 'root': {
                    global.postcssSass.before += node.content;
                    break;
                }
                case 'rule': {
                    if (global.postcssSass.comment) {
                        global.postcssSass.before = '\n' + node.content;
                    } else {
                        global.postcssSass.before = (global.postcssSass.before || '\n') + node.content;
                    }
                    break;
                }
                default:
            }
            break;
        }
        case 'declarationDelimiter': {
            global.postcssSass.before += node.content;
            break;
        }
        default:
    }
    return null;
}

module.exports = function sassToPostCssTree(source, opts) {
    var data = {
        node: gonzales.parse(source.toString('utf8'), { syntax: 'sass' }),
        input: new Input(source, opts),
        parent: null
    };
    return process(source, data.node, data.parent, data.input);
};
