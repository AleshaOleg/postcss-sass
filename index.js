var gonzales = require('gonzales-pe');
var postcss = require('postcss');
var fs = require('fs');

var nodes = [];

function getNodes(node) {
  if (node.hasOwnProperty('content') && typeof node.content === 'object') {
    node.content.map((props) => {
      if (/^[a-zA-Z]+$/.test(props.content) && typeof props.content !== 'object') {
        nodes.push(props);
      } else {
        getNodes(props);
      }
    })
  }
}

process.argv.forEach(function (val, index, array) {
  if (index > 1) {
    fs.readFile('./' + val, 'utf8', function (err, data) {
      if (err) {
        return console.log(err);
      }
      // Parse Sass file, and get Sass AST
      var sassAST = (gonzales.parse(data, {syntax: 'sass'}));
      console.log(sassAST);
      getNodes(sassAST);
      console.log('-----');
      console.log(nodes);
      console.log('-----');
    });
  }
});

const root = postcss.parse('a { background: white } a { background: black }');
console.log('-----');
console.log(root.nodes);
console.log('-----');
