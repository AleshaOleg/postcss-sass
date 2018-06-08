const postcss = require('postcss')
const gonzales = require('gonzales-pe')

const DEFAULT_RAWS_ROOT = {
  before: ''
}

const DEFAULT_RAWS_RULE = {
  before: '',
  between: ''
}

const DEFAULT_RAWS_DECL = {
  before: '',
  between: '',
  semicolon: false
}

const DEFAULT_COMMENT_DECL = {
  before: '',
  left: '',
  right: ''
}

class SassParser {
  constructor (input) {
    this.input = input
  }
  parse () {
    try {
      this.node = gonzales.parse(this.input.css, { syntax: 'sass' })
    } catch (error) {
      throw this.input.error(error.message, error.line, 1)
    }
    this.lines = this.input.css.match(/^.*(\r?\n|$)/gm)
    this.root = this.stylesheet(this.node)
  }
  extractSource (start, end) {
    const nodeLines = this.lines.slice(
      start.line - 1,
      end.line
    )

    nodeLines[0] = nodeLines[0].substring(start.column - 1)
    const last = nodeLines.length - 1
    nodeLines[last] = nodeLines[last].substring(0, end.column)

    return nodeLines.join('')
  }
  stylesheet (node) {
    // Create and set parameters for Root node
    const root = postcss.root()
    root.source = {
      start: node.start,
      end: node.end,
      input: this.input
    }
    // Raws for root node
    root.raws = {
      semicolon: DEFAULT_RAWS_ROOT.semicolon,
      before: DEFAULT_RAWS_ROOT.before
    }
    // Store spaces before root (if exist)
    this.raws = {
      before: ''
    }
    node.content.forEach(contentNode => this.process(contentNode, root))
    return root
  }
  process (node, parent) {
    if (this[node.type]) {
      return this[node.type](node, parent) || null
    } else {
      return null
    }
  }
  ruleset (node, parent) {
    // Loop to find the deepest ruleset node
    this.raws.multiRuleProp = ''

    node.content.forEach(contentNode => {
      switch (contentNode.type) {
        case 'block': {
          // Create Rule node
          const rule = postcss.rule()
          rule.selector = ''
          // Object to store raws for Rule
          const ruleRaws = {
            before: this.raws.before || DEFAULT_RAWS_RULE.before,
            between: DEFAULT_RAWS_RULE.between
          }

          // Variable to store spaces and symbols before declaration property
          this.raws.before = ''
          this.raws.comment = false

          // Look up throw all nodes in current ruleset node
          node.content
            .filter(content => content.type === 'block')
            .forEach(innerContentNode => this.process(innerContentNode, rule))

          if (rule.nodes.length) {
            // Write selector to Rule
            rule.selector = this.extractSource(
              node.start,
              contentNode.start
            ).slice(0, -1).replace(/\s+$/, spaces => {
              ruleRaws.between = spaces
              return ''
            })
            // Set parameters for Rule node
            rule.parent = parent
            rule.source = {
              start: node.start,
              end: node.end,
              input: this.input
            }
            rule.raws = ruleRaws
            parent.nodes.push(rule)
          }
          break
        }
        default:
      }
    })
  }
  block (node, parent) {
    // If nested rules exist, wrap current rule in new rule node
    if (this.raws.multiRule) {
      if (this.raws.multiRulePropVariable) {
        this.raws.multiRuleProp = `$${ this.raws.multiRuleProp }`
      }
      const multiRule = Object.assign(postcss.rule(), {
        source: {
          start: {
            line: node.start.line - 1,
            column: node.start.column
          },
          end: node.end,
          input: this.input
        },
        raws: {
          before: this.raws.before || DEFAULT_RAWS_RULE.before,
          between: DEFAULT_RAWS_RULE.between
        },
        parent,
        selector: (this.raws.customProperty ? '--' : '') + this.raws.multiRuleProp
      })
      parent.push(multiRule)
      parent = multiRule
    }

    this.raws.before = ''

    // Looking for declaration node in block node
    node.content.forEach(contentNode => this.process(contentNode, parent))
    if (this.raws.multiRule) {
      this.raws.beforeMulti = this.raws.before
    }
  }
  declaration (node, parent) {
    let isBlockInside = false
    // Create Declaration node
    const declarationNode = postcss.decl()
    declarationNode.prop = ''

    // Object to store raws for Declaration
    const declarationRaws = Object.assign(declarationNode.raws, {
      before: this.raws.before || DEFAULT_RAWS_DECL.before,
      between: DEFAULT_RAWS_DECL.between,
      semicolon: DEFAULT_RAWS_DECL.semicolon
    })

    this.raws.property = false
    this.raws.betweenBefore = false
    this.raws.comment = false
    // Looking for property and value node in declaration node
    node.content.forEach(contentNode => {
      switch (contentNode.type) {
        case 'customProperty':
          this.raws.customProperty = true
          // fall through
        case 'property': {
          /* this.raws.property to detect is property is already defined in current object */
          this.raws.property = true
          this.raws.multiRuleProp = contentNode.content[0].content
          this.raws.multiRulePropVariable = contentNode.content[0].type === 'variable'
          this.process(contentNode, declarationNode)
          break
        }
        case 'propertyDelimiter': {
          if (this.raws.property && !this.raws.betweenBefore) {
            /* If property is already defined and there's no ':' before it */
            declarationRaws.between += contentNode.content
            this.raws.multiRuleProp += contentNode.content
          } else {
            /* If ':' goes before property declaration, like :width 100px */
            this.raws.betweenBefore = true
            declarationRaws.before += contentNode.content
            this.raws.multiRuleProp += contentNode.content
          }
          break
        }
        case 'space': {
          declarationRaws.between += contentNode.content
          break
        }
        case 'value': {
          // Look up for a value for current property
          switch (contentNode.content[0].type) {
            case 'block': {
              isBlockInside = true
              // If nested rules exist
              if (Array.isArray(contentNode.content[0].content)) {
                this.raws.multiRule = true
              }
              this.process(contentNode.content[0], parent)
              break
            }
            case 'variable': {
              declarationNode.value = '$'
              this.process(contentNode, declarationNode)
              break
            }
            case 'color': {
              declarationNode.value = '#'
              this.process(contentNode, declarationNode)
              break
            }
            case 'number': {
              if (contentNode.content.length > 1) {
                declarationNode.value = contentNode.content.join('')
              } else {
                this.process(contentNode, declarationNode)
              }
              break
            }
            case 'parentheses': {
              declarationNode.value = '('
              this.process(contentNode, declarationNode)
              break
            }
            default: {
              this.process(contentNode, declarationNode)
            }
          }
          break
        }
        default:
      }
    })

    if (!isBlockInside) {
      // Set parameters for Declaration node
      declarationNode.source = {
        start: node.start,
        end: node.end,
        input: this.input
      }
      declarationNode.parent = parent
      parent.nodes.push(declarationNode)
    }

    this.raws.before = ''
    this.raws.customProperty = false
    this.raws.multiRuleProp = ''
    this.raws.property = false
  }
  customProperty (node, parent) {
    this.property(node, parent)
    parent.prop = `--${ parent.prop }`
  }
  property (node, parent) {
    // Set property for Declaration node
    switch (node.content[0].type) {
      case 'variable': {
        parent.prop += '$'
        break
      }
      case 'interpolation': {
        this.raws.interpolation = true
        parent.prop += '#{'
        break
      }
      default:
    }
    parent.prop += node.content[0].content
    if (this.raws.interpolation) {
      parent.prop += '}'
      this.raws.interpolation = false
    }
  }
  value (node, parent) {
    if (!parent.value) {
      parent.value = ''
    }
    // Set value for Declaration node
    if (node.content.length) {
      node.content.forEach(contentNode => {
        switch (contentNode.type) {
          case 'important': {
            parent.raws.important = contentNode.content
            parent.important = true
            const match = parent.value.match(/^(.*?)(\s*)$/)
            if (match) {
              parent.raws.important = match[2] + parent.raws.important
              parent.value = match[1]
            }
            break
          }
          case 'parentheses': {
            parent.value += contentNode.content.join('') + ')'
            break
          }
          case 'percentage': {
            parent.value += contentNode.content.join('') + '%'
            break
          }
          default: {
            if (contentNode.content.constructor === Array) {
              parent.value += contentNode.content.join('')
            } else {
              parent.value += contentNode.content
            }
          }
        }
      })
    }
  }
  singlelineComment (node, parent) {
    return this.comment(node, parent, true)
  }
  multilineComment (node, parent) {
    return this.comment(node, parent, false)
  }
  comment (node, parent, inline) {
    // https://github.com/nodesecurity/eslint-plugin-security#detect-unsafe-regex
    // eslint-disable-next-line security/detect-unsafe-regex
    const text = node.content.match(/^(\s*)((?:\S[\s\S]*?)?)(\s*)$/)

    this.raws.comment = true

    const comment = Object.assign(postcss.comment(), {
      text: text[2],
      raws: {
        before: this.raws.before || DEFAULT_COMMENT_DECL.before,
        left: text[1],
        right: text[3],
        inline
      }
    })

    if (this.raws.beforeMulti) {
      comment.raws.before += this.raws.beforeMulti
      this.raws.beforeMulti = undefined
    }

    parent.nodes.push(comment)
    this.raws.before = ''
  }
  space (node, parent) {
    // Spaces before root and rule
    switch (parent.type) {
      case 'root': {
        this.raws.before += node.content
        break
      }
      case 'rule': {
        if (this.raws.comment) {
          this.raws.before += node.content
        } else if (this.raws.loop) {
          parent.selector += node.content
        } else {
          this.raws.before = (this.raws.before || '\n') + node.content
        }
        break
      }
      default:
    }
  }
  declarationDelimiter (node) {
    this.raws.before += node.content
  }
  loop (node, parent) {
    const loop = postcss.rule()
    this.raws.comment = false
    this.raws.multiRule = false
    this.raws.loop = true
    loop.selector = ''
    loop.raws = {
      before: this.raws.before || DEFAULT_RAWS_RULE.before,
      between: DEFAULT_RAWS_RULE.between
    }
    if (this.raws.beforeMulti) {
      loop.raws.before += this.raws.beforeMulti
      this.raws.beforeMulti = undefined
    }
    node.content.forEach((contentNode, i) => {
      if (node.content[i + 1] && node.content[i + 1].type === 'block') {
        this.raws.loop = false
      }
      this.process(contentNode, loop)
    })
    parent.nodes.push(loop)
    this.raws.loop = false
  }
  atkeyword (node, parent) {
    parent.selector += `@${ node.content }`
  }
  operator (node, parent) {
    parent.selector += node.content
  }
  variable (node, parent) {
    if (this.raws.loop) {
      parent.selector += `$${ node.content[0].content }`
    } else {
      parent.selector += `#${ node.content[0].content }`
    }
  }
  ident (node, parent) {
    parent.selector += node.content
  }

  atrule(node, parent) {
    // Loop to find the deepest ruleset node
    this.raws.multiRuleProp = ''

    node.content.forEach(contentNode => {
      switch (contentNode.type) {
        case 'block': {
          // Create Rule node
          const atrule = postcss.atRule();
          atrule.name = node.type === 'atrule'
            ? 'media'
            : node.type;
          atrule.nodes = [];

          // Object to store raws for Atrule
          const atRuleRaws = {
            before: this.raws.before || DEFAULT_RAWS_RULE.before,
            between: DEFAULT_RAWS_RULE.between,
            afterName: ''
          }

          // Variable to store spaces and symbols before declaration property
          this.raws.before = ''
          this.raws.comment = false

          // Look up throw all nodes in current atrule node
          node.content
            .filter(content => content.type === 'block')
            .forEach(innerContentNode => this.process(innerContentNode, atrule))

          if (atrule.nodes.length) {
            // create a 'selector'('atname' + atRuleRaws.afterName + 'atrule parameters') string from the node
            let atSelectorString = this.extractSource(
              node.start,
              contentNode.start
            ).slice(1, -1).replace(/\s+$/, spaces => {
              if (spaces.indexOf('\n') > -1) {
                atRuleRaws.after = spaces.slice(spaces.indexOf('\n'));
                spaces = spaces.slice(0, spaces.indexOf('\n'));
              }
              atRuleRaws.between = spaces
              return ''
            });

            if (node.type === 'atrule') {
              // save spaces between the name of atrule and parameters
              atSelectorString = atSelectorString.slice(atSelectorString.indexOf(' '));
              atRuleRaws.afterName = atSelectorString.slice(0, atSelectorString.search(/[a-z]|\(/i));

              // save the parameters of this atRule
              atrule.params = atSelectorString.slice(atSelectorString.search(/[a-z]|\(/i));
            } else {
              // save the parameters of this atRule
              atrule.params = atSelectorString;
            }

            // Set parameters for Atrule node
            atrule.parent = parent
            atrule.source = {
              start: node.start,
              end: node.end,
              input: this.input
            }
            atrule.raws = atRuleRaws
            parent.nodes.push(atrule)
          }
          break
        }
        default:
      }
    })
  }

  mixin(node, parent) {
    this.atrule(node, parent)
  }

  include(node, parent) {
    this.atrule(node, parent)
  }
}

module.exports = SassParser
