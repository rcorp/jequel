(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var bfsTransform;

bfsTransform = function(obj, transforms) {
  var key, newNodes, node, nodeValue, parentNode, q, ref, root, transformFunction, transformPath;
  root = {
    value: obj,
    path: ''
  };
  for (transformPath in transforms) {
    transformFunction = transforms[transformPath];
    if (pointer.isMatchingPath(transformPath, '')) {
      root = transformFunction(root).node;
    }
  }
  q = [root];
  while (q.length !== 0) {
    parentNode = q.shift();
    node = {};
    if (typeof parentNode.value === 'object') {
      ref = parentNode.value;
      for (key in ref) {
        nodeValue = ref[key];
        node.path = parentNode.path ? parentNode.path + '/' + key : key;
        node.value = nodeValue;
        for (transformPath in transforms) {
          transformFunction = transforms[transformPath];
          if (pointer.isMatchingPath(transformPath, node.path)) {
            newNodes = transformFunction(node, {
              path: parentNode.path,
              value: parentNode.value
            });
            node = newNodes.node;
          }
        }
        q.push({
          path: node.path,
          value: node.value
        });
      }
    }
  }
  return obj;
};

module.exports = bfsTransform;


},{}],2:[function(require,module,exports){
module.exports = {
  bfsTransform: require('./bfs-transform.coffee'),
  pointer: require('./pointer.coffee'),
  treeMerge: require('./tree-merge.coffee'),
  treeRename: require('./tree-rename.coffee')
};


},{"./bfs-transform.coffee":1,"./pointer.coffee":3,"./tree-merge.coffee":4,"./tree-rename.coffee":5}],3:[function(require,module,exports){
var pointer, replaceLastString;

pointer = {};

pointer.setValue = function(obj, path, val) {
  var destPath, i, len, p, ref;
  destPath = 'obj';
  ref = path.split('/');
  for (i = 0, len = ref.length; i < len; i++) {
    p = ref[i];
    if (p !== "") {
      destPath += "['" + p + "']";
    }
  }
  eval(destPath + '=val');
  return obj;
};

pointer.getValue = function(obj, path) {
  var destPath, i, len, p, ref;
  destPath = 'obj';
  ref = path.split('/');
  for (i = 0, len = ref.length; i < len; i++) {
    p = ref[i];
    if (p !== "") {
      destPath += "['" + p + "']";
    }
  }
  return eval(destPath);
};

pointer.isMatchingPath = function(path1, path2) {
  var ref;
  path1 = path1.split('/');
  path2 = path2.split('/');
  if (path2.length > path1.length) {
    ref = [path1, path2], path2 = ref[0], path1 = ref[1];
  }
  return path1.every(function(el, index) {
    return ((path2[index] === '*') || (path2[index] === el) || (el === '*')) && ((el !== void 0) && (path2[index] !== void 0));
  });
};

replaceLastString = function(str, what, replacement) {
  var lastPc, pcs;
  pcs = str.split(what);
  lastPc = pcs.pop();
  return pcs.join(what) + replacement + lastPc;
};

module.exports = pointer;


},{}],4:[function(require,module,exports){
var pointer, treeMerge;

pointer = require('./pointer.coffee');

treeMerge = function(destNode, sourceNode, destPath) {
  var merge, node;
  merge = function(dNode, sNode) {
    var key, testKey;
    if (dNode === void 0) {
      testKey = Object.keys(sNode)[0];
      if (isNaN(parseInt(testKey !== false))) {
        dNode = [];
      } else {
        dNode = {};
      }
    }
    for (key in sNode) {
      if ((dNode[key] !== void 0) && (typeof dNode[key] === 'object')) {
        dNode[key] = merge(dNode[key], sNode[key]);
      } else {
        dNode[key] = sNode[key];
      }
    }
    return dNode;
  };
  node = pointer.getValue(destNode, destPath);
  node = merge(node, sourceNode);
  return pointer.setValue(destNode, destPath, node);
};

module.exports = treeMerge;


},{"./pointer.coffee":3}],5:[function(require,module,exports){
var bfsTransform, createRenameMapping, treeRename;

bfsTransform = require('./bfs-transform.coffee');

createRenameMapping = function(fromPath, toPath) {
  var i, j, len, map, offset, path;
  toPath = toPath.split('/');
  fromPath = fromPath.split('/');
  offset = toPath.length - fromPath.length;
  fromPath = toPath.slice(0, offset).concat(fromPath);
  map = {};
  for (i = j = 0, len = toPath.length; j < len; i = ++j) {
    path = toPath[i];
    if ((toPath[i] !== '*') && (toPath[i] !== fromPath[i])) {
      map[fromPath.slice(0, i + 1).join('/')] = toPath.slice(0, i + 1).join('/');
      fromPath[i] = toPath[i];
    } else {
      continue;
    }
  }
  return map;
};

treeRename = function(destObj, sourceObj, renameMaps) {
  var destPath, fromPath, map, results, sourcePath, toPath, transforms;
  map = {};
  for (sourcePath in renameMaps) {
    destPath = renameMaps[sourcePath];
    map = _.extend(map, createRenameMapping(sourcePath, destPath));
  }
  transforms = {};
  results = [];
  for (fromPath in map) {
    toPath = map[fromPath];
    transforms[fromPath] = (function(toPath, fromPath) {
      var fromKey, toKey;
      toKey = toPath.split('/').pop();
      fromKey = fromPath.split('/').pop();
      return function(node, parent) {
        if (parent.value[fromKey] !== void 0) {
          parent.value[toKey] = parent.value[fromKey];
          console.log('deleting', parent.value[fromKey]);
          delete parent.value[fromKey];
        }
        node.path = replaceLastString(node.path, '/' + fromKey, '/' + toKey);
        return {
          node: node,
          parent: parent
        };
      };
    })(toPath, fromPath);
    results.push(bfsTransform(destObj, transforms));
  }
  return results;
};

module.exports = treeRename;


},{"./bfs-transform.coffee":1}]},{},[2])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmNcXGJmcy10cmFuc2Zvcm0uY29mZmVlIiwic3JjXFxpbmRleC5jb2ZmZWUiLCJzcmNcXHBvaW50ZXIuY29mZmVlIiwic3JjXFx0cmVlLW1lcmdlLmNvZmZlZSIsInNyY1xcdHJlZS1yZW5hbWUuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDRUEsSUFBQTs7QUFBQSxZQUFBLEdBQWUsU0FBQyxHQUFELEVBQU0sVUFBTjtBQUdkLE1BQUE7RUFBQSxJQUFBLEdBQU87SUFBQyxLQUFBLEVBQU8sR0FBUjtJQUFhLElBQUEsRUFBTSxFQUFuQjs7QUFDUCxPQUFBLDJCQUFBOztJQUNDLElBQUcsT0FBTyxDQUFDLGNBQVIsQ0FBdUIsYUFBdkIsRUFBc0MsRUFBdEMsQ0FBSDtNQUNDLElBQUEsR0FBTyxpQkFBQSxDQUFrQixJQUFsQixDQUF1QixDQUFDLEtBRGhDOztBQUREO0VBS0EsQ0FBQSxHQUFJLENBQUMsSUFBRDtBQUNKLFNBQU0sQ0FBQyxDQUFDLE1BQUYsS0FBYyxDQUFwQjtJQUdDLFVBQUEsR0FBYSxDQUFDLENBQUMsS0FBRixDQUFBO0lBQ2IsSUFBQSxHQUFPO0lBRVAsSUFBRyxPQUFPLFVBQVUsQ0FBQyxLQUFsQixLQUEyQixRQUE5QjtBQUNDO0FBQUEsV0FBQSxVQUFBOztRQUNDLElBQUksQ0FBQyxJQUFMLEdBQWUsVUFBVSxDQUFDLElBQWQsR0FBd0IsVUFBVSxDQUFDLElBQVgsR0FBa0IsR0FBbEIsR0FBd0IsR0FBaEQsR0FBeUQ7UUFDckUsSUFBSSxDQUFDLEtBQUwsR0FBYTtBQU9iLGFBQUEsMkJBQUE7O1VBQ0MsSUFBRyxPQUFPLENBQUMsY0FBUixDQUF1QixhQUF2QixFQUFzQyxJQUFJLENBQUMsSUFBM0MsQ0FBSDtZQUNDLFFBQUEsR0FBVyxpQkFBQSxDQUFrQixJQUFsQixFQUF3QjtjQUFDLElBQUEsRUFBTSxVQUFVLENBQUMsSUFBbEI7Y0FB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QUFNLENBQUMsS0FBTSxDQUFBLE9BQUEsQ0FBYixLQUEyQixNQUE5QjtVQUNDLE1BQU0sQ0FBQyxLQUFNLENBQUEsS0FBQSxDQUFiLEdBQXNCLE1BQU0sQ0FBQyxLQUFNLENBQUEsT0FBQTtVQUNuQyxPQUFPLENBQUMsR0FBUixDQUFZLFVBQVosRUFBd0IsTUFBTSxDQUFDLEtBQU0sQ0FBQSxPQUFBLENBQXJDO1VBQ0EsT0FBTyxNQUFNLENBQUMsS0FBTSxDQUFBLE9BQUEsRUFIckI7O1FBS0EsSUFBSSxDQUFDLElBQUwsR0FBWSxpQkFBQSxDQUFrQixJQUFJLENBQUMsSUFBdkIsRUFBNkIsR0FBQSxHQUFNLE9BQW5DLEVBQTRDLEdBQUEsR0FBTSxLQUFsRDtBQUVaLGVBQU87VUFDTixJQUFBLEVBQU0sSUFEQTtVQUVOLE1BQUEsRUFBUSxNQUZGOztNQVJEO0lBUGdCLENBQUQsQ0FBQSxDQWtCbEIsTUFsQmtCLEVBa0JWLFFBbEJVO2lCQW9CdkIsWUFBQSxDQUFhLE9BQWIsRUFBc0IsVUFBdEI7QUFyQkQ7O0FBTlk7O0FBNkJiLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIiMgIyMgQkZTIFRyYW5zZm9ybWVyXHJcblxyXG5iZnNUcmFuc2Zvcm0gPSAob2JqLCB0cmFuc2Zvcm1zKS0+XHJcblxyXG5cdCMgQ2hlY2sgaWYgYW55IHRyYW5zZm9ybXMgbWF0Y2ggdGhlIHJvb3Qgbm9kZSB3aGljaCBoYXMgYSBwYXRoIGAnJ2AuXHJcblx0cm9vdCA9IHt2YWx1ZTogb2JqLCBwYXRoOiAnJ31cclxuXHRmb3IgdHJhbnNmb3JtUGF0aCwgdHJhbnNmb3JtRnVuY3Rpb24gb2YgdHJhbnNmb3Jtc1xyXG5cdFx0aWYgcG9pbnRlci5pc01hdGNoaW5nUGF0aCB0cmFuc2Zvcm1QYXRoLCAnJ1xyXG5cdFx0XHRyb290ID0gdHJhbnNmb3JtRnVuY3Rpb24ocm9vdCkubm9kZVxyXG5cclxuXHQjIEluaXRpYWxpc2UgYSBRdWV1ZSBEYXRhIFN0cnVjdHVyZSBhbmQgaG9sZCB0aGUgcm9vdCBPYmplY3RcclxuXHRxID0gW3Jvb3RdXHJcblx0d2hpbGUgcS5sZW5ndGggaXNudCAwXHJcblxyXG5cdFx0IyBUaGlzIGlzIHRoZSBwYXJlbnQgbm9kZSBiZWluZyBwb3BwZWQgb3V0IG9mIHRoZSBRdWV1ZS5cclxuXHRcdHBhcmVudE5vZGUgPSBxLnNoaWZ0KClcclxuXHRcdG5vZGUgPSB7fVxyXG5cclxuXHRcdGlmIHR5cGVvZiBwYXJlbnROb2RlLnZhbHVlIGlzICdvYmplY3QnXHJcblx0XHRcdGZvciBrZXksIG5vZGVWYWx1ZSBvZiBwYXJlbnROb2RlLnZhbHVlXHJcblx0XHRcdFx0bm9kZS5wYXRoID0gaWYgcGFyZW50Tm9kZS5wYXRoIHRoZW4gcGFyZW50Tm9kZS5wYXRoICsgJy8nICsga2V5IGVsc2Uga2V5XHJcblx0XHRcdFx0bm9kZS52YWx1ZSA9IG5vZGVWYWx1ZVxyXG5cclxuXHRcdFx0XHQjIE5vdyBsb29wIG92ZXIgYWxsIHRoZSB0cmFuc2Zvcm1zIGdpdmVuIHRvIHVzIGluIGB0cmFuc2Zvcm1zYC4gQSBtb3JlIGVmZmljaWVudCBzb2x1dGlvblxyXG5cdFx0XHRcdCMgbGF0ZXIgd291bGQgYmUgdG8ga2VlcCB0cmFjayBvZiB0aGUgbGV2ZWwgZGVwdGggb2YgdGhlIEJGUyBhbmQgb25seSBleGVjdXRlIHRob3NlXHJcblx0XHRcdFx0IyB0cmFuc2Zvcm1hdGlvbnMgb2YgdGhlIGN1cnJlbnQgbGV2ZWwuXHJcblx0XHRcdFx0I1xyXG5cdFx0XHRcdCMgRWc6IGAqLyovKmAgc2hvdWxkIG5vdCBiZSB0cmFuc2Zvcm1lZCB1bnRpbCBhdCBsZWFzdCBCRlMgaGFzIGdvbmUgMyBsZXZlcyBkb3duLlxyXG5cdFx0XHRcdGZvciB0cmFuc2Zvcm1QYXRoLCB0cmFuc2Zvcm1GdW5jdGlvbiBvZiB0cmFuc2Zvcm1zXHJcblx0XHRcdFx0XHRpZiBwb2ludGVyLmlzTWF0Y2hpbmdQYXRoIHRyYW5zZm9ybVBhdGgsIG5vZGUucGF0aFxyXG5cdFx0XHRcdFx0XHRuZXdOb2RlcyA9IHRyYW5zZm9ybUZ1bmN0aW9uIG5vZGUsIHtwYXRoOiBwYXJlbnROb2RlLnBhdGgsIHZhbHVlOiBwYXJlbnROb2RlLnZhbHVlfVxyXG5cdFx0XHRcdFx0XHRub2RlID0gbmV3Tm9kZXMubm9kZVxyXG5cdFx0XHRcdHEucHVzaCB7cGF0aDogbm9kZS5wYXRoLCB2YWx1ZTogbm9kZS52YWx1ZX1cclxuXHRyZXR1cm4gb2JqXHJcbm1vZHVsZS5leHBvcnRzID0gYmZzVHJhbnNmb3JtXHJcbiIsIm1vZHVsZS5leHBvcnRzID0gXHJcbiAgICBiZnNUcmFuc2Zvcm0gOiByZXF1aXJlKCcuL2Jmcy10cmFuc2Zvcm0uY29mZmVlJyksXHJcbiAgICBwb2ludGVyIDogcmVxdWlyZSgnLi9wb2ludGVyLmNvZmZlZScpLFxyXG4gICAgdHJlZU1lcmdlIDogcmVxdWlyZSgnLi90cmVlLW1lcmdlLmNvZmZlZScpLFxyXG4gICAgdHJlZVJlbmFtZTogcmVxdWlyZSgnLi90cmVlLXJlbmFtZS5jb2ZmZWUnKSAgICAgXHJcblxyXG5cclxuIiwiIyAjIyBKU09OIFBvaW50ZXIgT3BlcmF0aW9uc1xyXG5cclxucG9pbnRlciA9IHt9XHJcblxyXG4jIFVzZWQgdG8gaW5zZXJ0IGEgc3BlY2lmaWMgdmFsdWUgKGB2YWxgKSBhdCBhIHNwZWNpZmljIHBhdGggKGBwYXRoYCkgaW4gYSBnaXZlbiBKU09OIE9iamVjdCAoYG9iamApXHJcbnBvaW50ZXIuc2V0VmFsdWUgPSAob2JqLCBwYXRoLCB2YWwpIC0+XHJcblx0ZGVzdFBhdGggPSAnb2JqJ1xyXG5cdGZvciBwIGluIHBhdGguc3BsaXQgJy8nXHJcblxyXG5cdFx0IyBJbiBjYXNlIHBhdGggZG9lc250IGhhdmUgYSBgL2BcclxuXHRcdGRlc3RQYXRoICs9IFwiWycje3B9J11cIiBpZiBwIGlzbnQgXCJcIlxyXG5cdGV2YWwgZGVzdFBhdGggKyAnPXZhbCdcclxuXHRyZXR1cm4gb2JqXHJcblxyXG4jIFVzZWQgdG8gcmV0dXJuIHRoZSB2YWx1ZSBhdCBhIHNwZWNpZmljIHBhdGggKGBwYXRoYCkgaW4gYSBnaXZlbiBKU09OIE9iamVjdCAoYG9iamApXHJcbnBvaW50ZXIuZ2V0VmFsdWUgPSAob2JqLCBwYXRoKSAtPlxyXG5cdGRlc3RQYXRoID0gJ29iaidcclxuXHRmb3IgcCBpbiBwYXRoLnNwbGl0ICcvJ1xyXG5cclxuXHRcdCMgSW4gY2FzZSBwYXRoIGRvZXNudCBoYXZlIGEgYC9gXHJcblx0XHRkZXN0UGF0aCArPSBcIlsnI3twfSddXCIgaWYgcCBpc250IFwiXCJcclxuXHJcblx0IyBXb29wcyEgV2UgaGF2ZSB0byByZW1vdmUgZXZhbCBpbiB0aGlzIVxyXG5cdHJldHVybiBldmFsIGRlc3RQYXRoXHJcblxyXG4jIFVzZWQgdG8gbWF0Y2ggMiBkeW5hbWljIEpTT04gUG9pbnRlcnNcclxucG9pbnRlci5pc01hdGNoaW5nUGF0aCA9IChwYXRoMSwgcGF0aDIpIC0+XHJcblx0cGF0aDEgPSBwYXRoMS5zcGxpdCAnLydcclxuXHRwYXRoMiA9IHBhdGgyLnNwbGl0ICcvJ1xyXG5cdGlmIHBhdGgyLmxlbmd0aCA+IHBhdGgxLmxlbmd0aFxyXG5cdFx0W3BhdGgyLCBwYXRoMV0gPSBbcGF0aDEsIHBhdGgyXVxyXG5cdHBhdGgxLmV2ZXJ5IChlbCwgaW5kZXgpIC0+XHJcblx0XHQoKHBhdGgyW2luZGV4XSBpcyAnKicpIG9yIChwYXRoMltpbmRleF0gaXMgZWwpIG9yIChlbCBpcyAnKicpKSBhbmQgKChlbCBpc250IHVuZGVmaW5lZCkgYW5kIChwYXRoMltpbmRleF0gaXNudCB1bmRlZmluZWQpKVxyXG5cclxuIyBKYXZhc2NyaXB0J3MgbmF0aXZlIGByZXBsYWNlYCByZXBsYWNlcyBvbmx5IGZpcnN0IGluc3RhbmNlcyBvZiBzdWJzdHJpbmdzLlxyXG4jIFJlcGxhY2UgdGhlIGxhc3QgaW5zdGFuY2Ugb2YgYHN1YnN0cmAgaW4gYHN0cmAgd2l0aCBgbmV3U3Vic3RyYC5cclxucmVwbGFjZUxhc3RTdHJpbmcgPSAoc3RyLCB3aGF0LCByZXBsYWNlbWVudCkgLT5cclxuICAgIHBjcyA9IHN0ci5zcGxpdCh3aGF0KTtcclxuICAgIGxhc3RQYyA9IHBjcy5wb3AoKTtcclxuICAgIHJldHVybiBwY3Muam9pbih3aGF0KSArIHJlcGxhY2VtZW50ICsgbGFzdFBjO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBwb2ludGVyXHJcbiIsIiMgIyMgUmVjdXJzaXZlIG1lcmdlIG9mIDIgdHJlZXNcclxuI1xyXG4jIGBgYGpzXHJcbiMgdmFyIGExID0gW3tuYW1lOiAnbjEnLCBkZXNjcmlwdGlvbjogJ2R4J30sIHtuYW1lOiAnbjInfV07XHJcbiMgdmFyIGEyID0gW3tkZXNjcmlwdGlvbjogJ2QxJ30sIHtkZXNjcmlwdGlvbjogJ2QyJ30sIHtkZXNjcmlwdGlvbjogJ2QyJ31dO1xyXG4jXHJcbiMgdHJlZU1lcmdlIChhMSwgYTIpXHJcbiMgLy8gYTEgaXMgbm93XHJcbiMgW3tcIm5hbWVcIjpcIm4xXCIsXCJkZXNjcmlwdGlvblwiOlwiZDFcIn0se1wibmFtZVwiOlwibjJcIixcImRlc2NyaXB0aW9uXCI6XCJkMlwifSx7XCJkZXNjcmlwdGlvblwiOlwiZDJcIn1dXHJcbiNcclxuIyBgYGBcclxuI1xyXG4jIFRoaXMgZG9lcyBub3QgdGFrZSB2YXJpYWJsZSBwYXRocyBpbiBgZGVzdFBhdGhgLiBFZyBpbnN0ZWFkIG9mIGAnKi9rJ2AgeW91IGhhdmUgdG8gZ2l2ZSBgJzEvaydgXHJcblxyXG5wb2ludGVyID0gcmVxdWlyZSAnLi9wb2ludGVyLmNvZmZlZSdcclxuXHJcbnRyZWVNZXJnZSA9IChkZXN0Tm9kZSwgc291cmNlTm9kZSwgZGVzdFBhdGgpIC0+XHJcblx0bWVyZ2UgPSAoZE5vZGUsIHNOb2RlKSAtPlxyXG5cdFx0IyBUaGlzIHdoZW4gYGRlc3RQYXRoYCBwb2ludHMgdG8gYW4gdW5rbm93biBsb2NhdGlvbiFcclxuXHRcdGlmIGROb2RlIGlzIHVuZGVmaW5lZFxyXG5cdFx0XHR0ZXN0S2V5ID0gT2JqZWN0LmtleXMoc05vZGUpWzBdXHJcblxyXG5cdFx0XHQjIGlmIGtleSBpcyBlaXRoZXIgYSBOVW1iZXIgb3IgYSBOVW1iZXIgaW4gYSBzdHJpbmcuXHJcblx0XHRcdCMgRWc6IGAxMmAgb3IgYFwiMjJcImAgb3IgYCcwJ2AgZXRjLlxyXG5cdFx0XHRpZiBpc05hTiBwYXJzZUludCB0ZXN0S2V5IGlzbnQgZmFsc2VcclxuXHRcdFx0XHRkTm9kZSA9IFtdXHJcblxyXG5cdFx0XHRlbHNlXHJcblx0XHRcdFx0ZE5vZGUgPSB7fVxyXG5cclxuXHRcdGZvciBrZXkgb2Ygc05vZGVcclxuXHRcdFx0aWYgKGROb2RlW2tleV0gaXNudCB1bmRlZmluZWQpIGFuZCAodHlwZW9mIGROb2RlW2tleV0gaXMgJ29iamVjdCcpXHJcblx0XHRcdFx0ZE5vZGVba2V5XSA9IG1lcmdlKGROb2RlW2tleV0sIHNOb2RlW2tleV0pXHJcblx0XHRcdGVsc2VcclxuXHRcdFx0XHRkTm9kZVtrZXldID0gc05vZGVba2V5XVxyXG5cdFx0cmV0dXJuIGROb2RlXHJcblxyXG5cdG5vZGUgPSBwb2ludGVyLmdldFZhbHVlIGRlc3ROb2RlLCBkZXN0UGF0aFxyXG5cdG5vZGUgPSBtZXJnZSBub2RlLCBzb3VyY2VOb2RlXHJcblx0cG9pbnRlci5zZXRWYWx1ZSBkZXN0Tm9kZSwgZGVzdFBhdGgsIG5vZGVcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gdHJlZU1lcmdlXHJcbiIsIiMgUmV0dXJucyBhIGBtYXBgIG9iamVjdCB3aGljaCBwbGFjZXMgKnBhdGhzIHRvIGJlIGNoYW5nZWQqIGFzIGtleXMgYW5kICpjaGFuZ2VkIHBhdGhzKiBhcyB2YWx1ZXMuXHJcbiMgR2l2ZW4gYGZyb21QYXRoID0gJyovazMvazQvKi9rNSdgIGFuZCBgdG9QYXRoID0gJyovKi8qL2MzL2M0LyovYzUnYFxyXG4jIHRoaXMgcmV0dXJucyBhIGBtYXBgIG9iamVjdFxyXG4jIGBgYFxyXG4jIFx0bWFwcyA9IHtcclxuIyBcdFx0JyovKi8qL2szJzogJyovKi8qL2MzJyxcclxuIyBcdFx0JyovKi8qL2MzL2s0JzogJyovKi8qL2MzL2M0JyxcclxuIyBcdFx0JyovKi8qL2MzL2M0LyovazUnOiAnKi8qLyovYzMvYzQvKi9jNScsXHJcbiMgXHR9XHJcbiMgYGBgXHJcblxyXG5iZnNUcmFuc2Zvcm0gPSByZXF1aXJlICcuL2Jmcy10cmFuc2Zvcm0uY29mZmVlJ1xyXG5cclxuY3JlYXRlUmVuYW1lTWFwcGluZyA9IChmcm9tUGF0aCwgdG9QYXRoKSAtPlxyXG5cdHRvUGF0aCA9IHRvUGF0aC5zcGxpdCAnLydcclxuXHRmcm9tUGF0aCA9IGZyb21QYXRoLnNwbGl0ICcvJ1xyXG5cdG9mZnNldCA9IHRvUGF0aC5sZW5ndGggLSBmcm9tUGF0aC5sZW5ndGhcclxuXHJcblx0IyBgdG9QYXRoYCBpcyB1c3VhbGx5ID4gYGZyb21QYXRoYC4gU2luY2UgdGhlIHN1YnRyZWUgd2lsbCBiZSBqb2ludCwgd2Ugd2lsbCBuZWVkIHRvIGFwcGVuZCB0aGUgZGlmZmVyZW5jZSB0b1xyXG5cdCMgYGZyb21QYXRoYFxyXG5cdGZyb21QYXRoID0gdG9QYXRoLnNsaWNlKDAsIG9mZnNldCkuY29uY2F0KGZyb21QYXRoKVxyXG5cclxuXHQjIFRoZSB2YXJpYWJsZSB1c2VkIHRvIGhvbGQgdGhlIHJldHVybiB2YWx1ZS5cclxuXHRtYXAgPSB7fVxyXG5cdGZvciBwYXRoLCBpIGluIHRvUGF0aFxyXG5cdFx0aWYgKHRvUGF0aFtpXSBpc250ICcqJykgYW5kICh0b1BhdGhbaV0gaXNudCBmcm9tUGF0aFtpXSlcclxuXHRcdFx0bWFwW2Zyb21QYXRoLnNsaWNlKDAsIGkgKyAxKS5qb2luKCcvJyldID0gdG9QYXRoLnNsaWNlKDAsaSArIDEpLmpvaW4oJy8nKVxyXG5cdFx0XHRmcm9tUGF0aFtpXSA9IHRvUGF0aFtpXVxyXG5cdFx0ZWxzZVxyXG5cdFx0XHRjb250aW51ZVxyXG5cdHJldHVybiBtYXBcclxuXHJcbnRyZWVSZW5hbWUgPSAoZGVzdE9iaiwgc291cmNlT2JqLCByZW5hbWVNYXBzKSAtPlxyXG5cdG1hcCA9IHt9XHJcblx0Zm9yIHNvdXJjZVBhdGgsIGRlc3RQYXRoIG9mIHJlbmFtZU1hcHNcclxuXHRcdG1hcCA9IF8uZXh0ZW5kIG1hcCwgY3JlYXRlUmVuYW1lTWFwcGluZyBzb3VyY2VQYXRoLCBkZXN0UGF0aFxyXG5cclxuXHR0cmFuc2Zvcm1zID0ge31cclxuXHRmb3IgZnJvbVBhdGgsIHRvUGF0aCBvZiBtYXBcclxuXHRcdHRyYW5zZm9ybXNbZnJvbVBhdGhdID0gKCh0b1BhdGgsIGZyb21QYXRoKSAtPlxyXG5cclxuXHRcdFx0IyBzbGljZSgpIGFuZCBwb3AoKSBHZXQgdGhlIGxhc3QgcGF0aCBwb2ludGVyIC8ga2V5XHJcblx0XHRcdCMgaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMTIwOTkzNDFcclxuXHRcdFx0dG9LZXkgPSB0b1BhdGguc3BsaXQoJy8nKS5wb3AoKVxyXG5cdFx0XHRmcm9tS2V5ID0gZnJvbVBhdGguc3BsaXQoJy8nKS5wb3AoKVxyXG5cclxuXHRcdFx0cmV0dXJuIChub2RlLCBwYXJlbnQpIC0+XHJcblx0XHRcdFx0aWYgcGFyZW50LnZhbHVlW2Zyb21LZXldIGlzbnQgdW5kZWZpbmVkXHJcblx0XHRcdFx0XHRwYXJlbnQudmFsdWVbdG9LZXldID0gcGFyZW50LnZhbHVlW2Zyb21LZXldXHJcblx0XHRcdFx0XHRjb25zb2xlLmxvZyAnZGVsZXRpbmcnLCBwYXJlbnQudmFsdWVbZnJvbUtleV1cclxuXHRcdFx0XHRcdGRlbGV0ZSBwYXJlbnQudmFsdWVbZnJvbUtleV1cclxuXHJcblx0XHRcdFx0bm9kZS5wYXRoID0gcmVwbGFjZUxhc3RTdHJpbmcobm9kZS5wYXRoLCAnLycgKyBmcm9tS2V5LCAnLycgKyB0b0tleSlcclxuXHJcblx0XHRcdFx0cmV0dXJuIHtcclxuXHRcdFx0XHRcdG5vZGU6IG5vZGVcclxuXHRcdFx0XHRcdHBhcmVudDogcGFyZW50XHJcblx0XHRcdFx0fSkodG9QYXRoLCBmcm9tUGF0aClcclxuXHJcblx0XHRiZnNUcmFuc2Zvcm0gZGVzdE9iaiwgdHJhbnNmb3Jtc1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB0cmVlUmVuYW1lXHJcbiJdfQ==
