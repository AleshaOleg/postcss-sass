import 'package:path/path.dart' as p;

import 'package:sass/src/ast/sass.dart';
import 'package:sass/src/exception.dart';
import 'package:sass/src/utils.dart';
import 'package:sass/src/visitor/perform.dart';
import 'package:sass/src/visitor/serialize.dart';

String sassAst(String path, {bool color: false}) {
    var contents = readSassFile(path);
    var url = p.toUri(path);
    var sassTree = p.extension(path) == '.sass'
        ? new Stylesheet.parseSass(contents, url: url, color: color)
        : new Stylesheet.parseScss(contents, url: url, color: color);
    var cssTree = evaluate(sassTree, color: color);
    return toCss(cssTree);
  }

void main(List<String> args) {
  print(sassAst(args.first));
}
