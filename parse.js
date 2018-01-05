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

function process(node, parent, input, globalPostcssSass) {
    function bindedProcess(innerNode, innerParent = parent) {
        return process(innerNode, innerParent, input, globalPostcssSass);
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
            globalPostcssSass.before = '';
            node.content.forEach(contentNode => bindedProcess(contentNode, root));
            return root;
        }
        case 'ruleset': {
            // Loop to find the deepest ruleset node
            let pseudoClassFirst = false;
            // Define new selector
            let selector = '';
            globalPostcssSass.multiRuleProp = '';

            node.content.forEach(contentNode => {
                switch (contentNode.type) {
                    case 'block': {
                        // Create Rule node
                        const rule = postcss.rule();
                        rule.selector = '';
                        // Object to store raws for Rule
                        const ruleRaws = {
                            before: globalPostcssSass.before || DEFAULT_RAWS_RULE.before,
                            between: DEFAULT_RAWS_RULE.between
                        };

                        // Variable to store spaces and symbols before declaration property
                        globalPostcssSass.before = '';
                        globalPostcssSass.comment = false;

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
                            rule.raws = ruleRaws;
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
                                    if (innerContentNode.content.length > 1) {
                                        innerContentNode.content.forEach((classContentNode) => {
                                            if (classContentNode.content.constructor !== Array ) {
                                                selector += classContentNode.content;
                                            } else {
                                                switch (classContentNode.type) {
                                                    case 'interpolation': {
                                                        classContentNode.content.forEach((interpolationContentNode) => {
                                                            selector += `\#{${interpolationContentNode.content}}`;
                                                        });
                                                        break;
                                                    }
                                                    default:
                                                }
                                            }
                                        });
                                    }
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
                            if (innerContentNode.content.length === 1) {
                                selector += innerContentNode.content;
                            }
                        });
                        break;
                    }
                    default:
                }
            });
            break;
        }
        case 'block': {
            // If nested rules exist, wrap current rule in new rule node
            if (globalPostcssSass.multiRule) {
                if (globalPostcssSass.multiRulePropVariable) {
                    globalPostcssSass.multiRuleProp = `\$${globalPostcssSass.multiRuleProp}`;
                }
                const multiRule = Object.assign(postcss.rule(), {
                    source: {
                        start: {
                            line: node.start.line - 1,
                            column: node.start.column
                        },
                        end: node.end,
                        input: input
                    },
                    raws: {
                        before: globalPostcssSass.before || DEFAULT_RAWS_RULE.before,
                        between: DEFAULT_RAWS_RULE.between
                    },
                    parent,
                    selector: globalPostcssSass.multiRuleProp
                });
                parent.push(multiRule);
                parent = multiRule;
            }

            globalPostcssSass.before = '';

            // Looking for declaration node in block node
            node.content.forEach(contentNode => bindedProcess(contentNode));
            if (globalPostcssSass.multiRule) {
                globalPostcssSass.beforeMulti = globalPostcssSass.before;
            }
            break;
        }
        case 'declaration': {
            let isBlockInside = false;
            // Create Declaration node
            const declarationNode = postcss.decl();
            declarationNode.prop = '';

            // Object to store raws for Declaration
            const declarationRaws = {
                before: globalPostcssSass.before || DEFAULT_RAWS_DECL.before,
                between: DEFAULT_RAWS_DECL.between,
                semicolon: DEFAULT_RAWS_DECL.semicolon
            };

            globalPostcssSass.property = false;
            globalPostcssSass.betweenBefore = false;
            globalPostcssSass.comment = false;
            // Looking for property and value node in declaration node
            node.content.forEach((contentNode) => {
                switch (contentNode.type) {
                    case 'property': {
                        /* global.property to detect is property is already defined in current object */
                        globalPostcssSass.property = true;
                        globalPostcssSass.multiRuleProp = contentNode.content[0].content;
                        globalPostcssSass.multiRulePropVariable = contentNode.content[0].type === 'variable';
                        bindedProcess(contentNode, declarationNode);
                        break;
                    }
                    case 'propertyDelimiter': {
                        if (globalPostcssSass.property && !globalPostcssSass.betweenBefore) {
                            /* If property is already defined and there's no ':' before it */
                            declarationRaws.between += contentNode.content;
                            globalPostcssSass.multiRuleProp += contentNode.content;
                        } else {
                            /* If ':' goes before property declaration, like :width 100px */
                            globalPostcssSass.betweenBefore = true;
                            declarationRaws.before += contentNode.content;
                            globalPostcssSass.multiRuleProp += contentNode.content;
                        }
                        break;
                    }
                    case 'space': {
                        declarationRaws.between += contentNode.content;
                        break;
                    }
                    case 'value': {
                        // Look up for a value for current property
                        switch (contentNode.content[0].type) {
                            case 'block': {
                                isBlockInside = true;
                                // If nested rules exist
                                if (typeof contentNode.content[0].content === 'object') {
                                    globalPostcssSass.multiRule = true;
                                }
                                bindedProcess(contentNode.content[0]);
                                break;
                            }
                            case 'variable': {
                                declarationNode.value = '$';
                                bindedProcess(contentNode, declarationNode);
                                break;
                            }
                            case 'color': {
                                declarationNode.value = '#';
                                bindedProcess(contentNode, declarationNode);
                                break;
                            }
                            case 'number': {
                                if (contentNode.content.length > 1) {
                                    declarationNode.value = contentNode.content.join('');
                                } else {
                                    bindedProcess(contentNode, declarationNode);
                                }
                                break;
                            }
                            case 'parentheses': {
                                declarationNode.value = '(';
                                bindedProcess(contentNode, declarationNode);
                                break;
                            }
                            default: {
                                bindedProcess(contentNode, declarationNode);
                            }
                        }
                        break;
                    }
                    default:
                }
            });

            if (!isBlockInside) {
                // Set parameters for Declaration node
                declarationNode.source = {
                    start: node.start,
                    end: node.end,
                    input: input
                };
                declarationNode.parent = parent;
                declarationNode.raws = declarationRaws;
                parent.nodes.push(declarationNode);
            }

            globalPostcssSass.before = '';
            globalPostcssSass.multiRuleProp = '';
            globalPostcssSass.property = false;
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
                            parent.value += contentNode.content.join('') + ')';
                            break;
                        }
                        default: {
                            if (contentNode.content.constructor === Array) {
                                parent.value += contentNode.content.join('');
                            } else {
                                parent.value += contentNode.content;
                            }
                        }
                    }
                });
            }
            break;
        }
        case 'singlelineComment':
        case 'multilineComment': {
            const rawText = node.content;
            const text = rawText.trim();

            const left = rawText.search(/\S/);
            const right = rawText.length - text.length - left;

            globalPostcssSass.comment = true;

            const comment = Object.assign(postcss.comment(), {
                text,
                raws: {
                    before: globalPostcssSass.before || DEFAULT_COMMENT_DECL.before,
                    left: new Array(left + 1).join(' '),
                    right: new Array(right + 1).join(' '),
                    commentType: node.type === 'singlelineComment' ? 'single' : 'multi'
                }
            });

            if (globalPostcssSass.beforeMulti) {
                comment.raws.before += globalPostcssSass.beforeMulti;
                globalPostcssSass.beforeMulti = undefined;
            }

            parent.nodes.push(comment);
            globalPostcssSass.before = '';
            break;
        }
        case 'space': {
            // Spaces before root and rule
            switch (parent.type) {
                case 'root': {
                    globalPostcssSass.before += node.content;
                    break;
                }
                case 'rule': {
                    if (globalPostcssSass.comment) {
                        globalPostcssSass.before = '\n' + node.content;
                    } else if (globalPostcssSass.loop) {
                        parent.selector += node.content;
                    } else {
                        globalPostcssSass.before = (globalPostcssSass.before || '\n') + node.content;
                    }
                    break;
                }
                default:
            }
            break;
        }
        case 'declarationDelimiter': {
            globalPostcssSass.before += node.content;
            break;
        }
        case 'loop': {
            const loop = postcss.rule();
            globalPostcssSass.comment = false;
            globalPostcssSass.multiRule = false;
            globalPostcssSass.loop = true;
            loop.selector = '';
            loop.raws = {
                before: globalPostcssSass.before || DEFAULT_RAWS_RULE.before,
                between: DEFAULT_RAWS_RULE.between
            };
            if (globalPostcssSass.beforeMulti) {
                loop.raws.before += globalPostcssSass.beforeMulti;
                globalPostcssSass.beforeMulti = undefined;
            }
            node.content.forEach((contentNode, i) => {
                if (node.content[i + 1] && node.content[i + 1].type === 'block') {
                    globalPostcssSass.loop = false;
                }
                bindedProcess(contentNode, loop);
            });
            parent.nodes.push(loop);
            globalPostcssSass.loop = false;
            break;
        }
        case 'atkeyword': {
            parent.selector += `@${node.content}`;
            break;
        }
        case 'operator': {
            parent.selector += node.content;
            break;
        }
        case 'variable': {
            if (globalPostcssSass.loop) {
                parent.selector += `\$${node.content[0].content}`;
            } else {
                parent.selector += `\#${node.content[0].content}`;
            }
            break;
        }
        case 'ident': {
            parent.selector += node.content;
            break;
        }
        default:
    }
    return null;
}

module.exports = function sassToPostCssTree(source, opts) {
    const input = new Input(source, opts);
    let node;
    try {
        node = gonzales.parse(source.toString('utf8'), { syntax: 'sass' });
    } catch (ex) {
        if (ex.name === 'Parsing error') {
            throw input.error(ex.message, ex.line, 1);
        } else {
            throw ex;
        }
    }

    return process(node, null, input, {});
};
