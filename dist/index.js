(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.jequel = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
  'bfsTransform': require('./bfs-transform.coffee'),
  'pointer': require('./pointer.coffee'),
  'tree-merge': require('./tree-merge.coffee'),
  'tree-rename': require('./tree-rename.coffee')
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


},{"./bfs-transform.coffee":1}]},{},[2])(2)
});
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmNcXGJmcy10cmFuc2Zvcm0uY29mZmVlIiwic3JjXFxpbmRleC5jb2ZmZWUiLCJzcmNcXHBvaW50ZXIuY29mZmVlIiwic3JjXFx0cmVlLW1lcmdlLmNvZmZlZSIsInNyY1xcdHJlZS1yZW5hbWUuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDRUEsSUFBQTs7QUFBQSxZQUFBLEdBQWUsU0FBQyxHQUFELEVBQU0sVUFBTjtBQUdkLE1BQUE7RUFBQSxJQUFBLEdBQU87SUFBQyxLQUFBLEVBQU8sR0FBUjtJQUFhLElBQUEsRUFBTSxFQUFuQjs7QUFDUCxPQUFBLDJCQUFBOztJQUNDLElBQUcsT0FBTyxDQUFDLGNBQVIsQ0FBdUIsYUFBdkIsRUFBc0MsRUFBdEMsQ0FBSDtNQUNDLElBQUEsR0FBTyxpQkFBQSxDQUFrQixJQUFsQixDQUF1QixDQUFDLEtBRGhDOztBQUREO0VBS0EsQ0FBQSxHQUFJLENBQUMsSUFBRDtBQUNKLFNBQU0sQ0FBQyxDQUFDLE1BQUYsS0FBYyxDQUFwQjtJQUdDLFVBQUEsR0FBYSxDQUFDLENBQUMsS0FBRixDQUFBO0lBQ2IsSUFBQSxHQUFPO0lBRVAsSUFBRyxPQUFPLFVBQVUsQ0FBQyxLQUFsQixLQUEyQixRQUE5QjtBQUNDO0FBQUEsV0FBQSxVQUFBOztRQUNDLElBQUksQ0FBQyxJQUFMLEdBQWUsVUFBVSxDQUFDLElBQWQsR0FBd0IsVUFBVSxDQUFDLElBQVgsR0FBa0IsR0FBbEIsR0FBd0IsR0FBaEQsR0FBeUQ7UUFDckUsSUFBSSxDQUFDLEtBQUwsR0FBYTtBQU9iLGFBQUEsMkJBQUE7O1VBQ0MsSUFBRyxPQUFPLENBQUMsY0FBUixDQUF1QixhQUF2QixFQUFzQyxJQUFJLENBQUMsSUFBM0MsQ0FBSDtZQUNDLFFBQUEsR0FBVyxpQkFBQSxDQUFrQixJQUFsQixFQUF3QjtjQUFDLElBQUEsRUFBTSxVQUFVLENBQUMsSUFBbEI7Y0FB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LE1BQU0sQ0FBQyxLQUFNLENBQUEsT0FBQSxDQUFiLEtBQTJCLE1BQTlCO1VBQ0MsTUFBTSxDQUFDLEtBQU0sQ0FBQSxLQUFBLENBQWIsR0FBc0IsTUFBTSxDQUFDLEtBQU0sQ0FBQSxPQUFBO1VBQ25DLE9BQU8sQ0FBQyxHQUFSLENBQVksVUFBWixFQUF3QixNQUFNLENBQUMsS0FBTSxDQUFBLE9BQUEsQ0FBckM7VUFDQSxPQUFPLE1BQU0sQ0FBQyxLQUFNLENBQUEsT0FBQSxFQUhyQjs7UUFLQSxJQUFJLENBQUMsSUFBTCxHQUFZLGlCQUFBLENBQWtCLElBQUksQ0FBQyxJQUF2QixFQUE2QixHQUFBLEdBQU0sT0FBbkMsRUFBNEMsR0FBQSxHQUFNLEtBQWxEO0FBRVosZUFBTztVQUNOLElBQUEsRUFBTSxJQURBO1VBRU4sTUFBQSxFQUFRLE1BRkY7O01BUkQ7SUFQZ0IsQ0FBRCxDQUFBLENBa0JsQixNQWxCa0IsRUFrQlYsUUFsQlU7aUJBb0J2QixZQUFBLENBQWEsT0FBYixFQUFzQixVQUF0QjtBQXJCRDs7QUFOWTs7QUE2QmIsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiIyAjIyBCRlMgVHJhbnNmb3JtZXJcclxuXHJcbmJmc1RyYW5zZm9ybSA9IChvYmosIHRyYW5zZm9ybXMpLT5cclxuXHJcblx0IyBDaGVjayBpZiBhbnkgdHJhbnNmb3JtcyBtYXRjaCB0aGUgcm9vdCBub2RlIHdoaWNoIGhhcyBhIHBhdGggYCcnYC5cclxuXHRyb290ID0ge3ZhbHVlOiBvYmosIHBhdGg6ICcnfVxyXG5cdGZvciB0cmFuc2Zvcm1QYXRoLCB0cmFuc2Zvcm1GdW5jdGlvbiBvZiB0cmFuc2Zvcm1zXHJcblx0XHRpZiBwb2ludGVyLmlzTWF0Y2hpbmdQYXRoIHRyYW5zZm9ybVBhdGgsICcnXHJcblx0XHRcdHJvb3QgPSB0cmFuc2Zvcm1GdW5jdGlvbihyb290KS5ub2RlXHJcblxyXG5cdCMgSW5pdGlhbGlzZSBhIFF1ZXVlIERhdGEgU3RydWN0dXJlIGFuZCBob2xkIHRoZSByb290IE9iamVjdFxyXG5cdHEgPSBbcm9vdF1cclxuXHR3aGlsZSBxLmxlbmd0aCBpc250IDBcclxuXHJcblx0XHQjIFRoaXMgaXMgdGhlIHBhcmVudCBub2RlIGJlaW5nIHBvcHBlZCBvdXQgb2YgdGhlIFF1ZXVlLlxyXG5cdFx0cGFyZW50Tm9kZSA9IHEuc2hpZnQoKVxyXG5cdFx0bm9kZSA9IHt9XHJcblxyXG5cdFx0aWYgdHlwZW9mIHBhcmVudE5vZGUudmFsdWUgaXMgJ29iamVjdCdcclxuXHRcdFx0Zm9yIGtleSwgbm9kZVZhbHVlIG9mIHBhcmVudE5vZGUudmFsdWVcclxuXHRcdFx0XHRub2RlLnBhdGggPSBpZiBwYXJlbnROb2RlLnBhdGggdGhlbiBwYXJlbnROb2RlLnBhdGggKyAnLycgKyBrZXkgZWxzZSBrZXlcclxuXHRcdFx0XHRub2RlLnZhbHVlID0gbm9kZVZhbHVlXHJcblxyXG5cdFx0XHRcdCMgTm93IGxvb3Agb3ZlciBhbGwgdGhlIHRyYW5zZm9ybXMgZ2l2ZW4gdG8gdXMgaW4gYHRyYW5zZm9ybXNgLiBBIG1vcmUgZWZmaWNpZW50IHNvbHV0aW9uXHJcblx0XHRcdFx0IyBsYXRlciB3b3VsZCBiZSB0byBrZWVwIHRyYWNrIG9mIHRoZSBsZXZlbCBkZXB0aCBvZiB0aGUgQkZTIGFuZCBvbmx5IGV4ZWN1dGUgdGhvc2VcclxuXHRcdFx0XHQjIHRyYW5zZm9ybWF0aW9ucyBvZiB0aGUgY3VycmVudCBsZXZlbC5cclxuXHRcdFx0XHQjXHJcblx0XHRcdFx0IyBFZzogYCovKi8qYCBzaG91bGQgbm90IGJlIHRyYW5zZm9ybWVkIHVudGlsIGF0IGxlYXN0IEJGUyBoYXMgZ29uZSAzIGxldmVzIGRvd24uXHJcblx0XHRcdFx0Zm9yIHRyYW5zZm9ybVBhdGgsIHRyYW5zZm9ybUZ1bmN0aW9uIG9mIHRyYW5zZm9ybXNcclxuXHRcdFx0XHRcdGlmIHBvaW50ZXIuaXNNYXRjaGluZ1BhdGggdHJhbnNmb3JtUGF0aCwgbm9kZS5wYXRoXHJcblx0XHRcdFx0XHRcdG5ld05vZGVzID0gdHJhbnNmb3JtRnVuY3Rpb24gbm9kZSwge3BhdGg6IHBhcmVudE5vZGUucGF0aCwgdmFsdWU6IHBhcmVudE5vZGUudmFsdWV9XHJcblx0XHRcdFx0XHRcdG5vZGUgPSBuZXdOb2Rlcy5ub2RlXHJcblx0XHRcdFx0cS5wdXNoIHtwYXRoOiBub2RlLnBhdGgsIHZhbHVlOiBub2RlLnZhbHVlfVxyXG5cdHJldHVybiBvYmpcclxubW9kdWxlLmV4cG9ydHMgPSBiZnNUcmFuc2Zvcm1cclxuIiwiXHJcbm1vZHVsZS5leHBvcnRzID0gXHJcbiAgICAnYmZzVHJhbnNmb3JtJzogcmVxdWlyZSAoJy4vYmZzLXRyYW5zZm9ybS5jb2ZmZWUnKVxyXG4gICAgJ3BvaW50ZXInOiByZXF1aXJlKCcuL3BvaW50ZXIuY29mZmVlJylcclxuICAgICd0cmVlLW1lcmdlJzogcmVxdWlyZSgnLi90cmVlLW1lcmdlLmNvZmZlZScpXHJcbiAgICAndHJlZS1yZW5hbWUnOiByZXF1aXJlKCcuL3RyZWUtcmVuYW1lLmNvZmZlZScpIiwiIyAjIyBKU09OIFBvaW50ZXIgT3BlcmF0aW9uc1xyXG5cclxucG9pbnRlciA9IHt9XHJcblxyXG4jIFVzZWQgdG8gaW5zZXJ0IGEgc3BlY2lmaWMgdmFsdWUgKGB2YWxgKSBhdCBhIHNwZWNpZmljIHBhdGggKGBwYXRoYCkgaW4gYSBnaXZlbiBKU09OIE9iamVjdCAoYG9iamApXHJcbnBvaW50ZXIuc2V0VmFsdWUgPSAob2JqLCBwYXRoLCB2YWwpIC0+XHJcblx0ZGVzdFBhdGggPSAnb2JqJ1xyXG5cdGZvciBwIGluIHBhdGguc3BsaXQgJy8nXHJcblxyXG5cdFx0IyBJbiBjYXNlIHBhdGggZG9lc250IGhhdmUgYSBgL2BcclxuXHRcdGRlc3RQYXRoICs9IFwiWycje3B9J11cIiBpZiBwIGlzbnQgXCJcIlxyXG5cdGV2YWwgZGVzdFBhdGggKyAnPXZhbCdcclxuXHRyZXR1cm4gb2JqXHJcblxyXG4jIFVzZWQgdG8gcmV0dXJuIHRoZSB2YWx1ZSBhdCBhIHNwZWNpZmljIHBhdGggKGBwYXRoYCkgaW4gYSBnaXZlbiBKU09OIE9iamVjdCAoYG9iamApXHJcbnBvaW50ZXIuZ2V0VmFsdWUgPSAob2JqLCBwYXRoKSAtPlxyXG5cdGRlc3RQYXRoID0gJ29iaidcclxuXHRmb3IgcCBpbiBwYXRoLnNwbGl0ICcvJ1xyXG5cclxuXHRcdCMgSW4gY2FzZSBwYXRoIGRvZXNudCBoYXZlIGEgYC9gXHJcblx0XHRkZXN0UGF0aCArPSBcIlsnI3twfSddXCIgaWYgcCBpc250IFwiXCJcclxuXHJcblx0IyBXb29wcyEgV2UgaGF2ZSB0byByZW1vdmUgZXZhbCBpbiB0aGlzIVxyXG5cdHJldHVybiBldmFsIGRlc3RQYXRoXHJcblxyXG4jIFVzZWQgdG8gbWF0Y2ggMiBkeW5hbWljIEpTT04gUG9pbnRlcnNcclxucG9pbnRlci5pc01hdGNoaW5nUGF0aCA9IChwYXRoMSwgcGF0aDIpIC0+XHJcblx0cGF0aDEgPSBwYXRoMS5zcGxpdCAnLydcclxuXHRwYXRoMiA9IHBhdGgyLnNwbGl0ICcvJ1xyXG5cdGlmIHBhdGgyLmxlbmd0aCA+IHBhdGgxLmxlbmd0aFxyXG5cdFx0W3BhdGgyLCBwYXRoMV0gPSBbcGF0aDEsIHBhdGgyXVxyXG5cdHBhdGgxLmV2ZXJ5IChlbCwgaW5kZXgpIC0+XHJcblx0XHQoKHBhdGgyW2luZGV4XSBpcyAnKicpIG9yIChwYXRoMltpbmRleF0gaXMgZWwpIG9yIChlbCBpcyAnKicpKSBhbmQgKChlbCBpc250IHVuZGVmaW5lZCkgYW5kIChwYXRoMltpbmRleF0gaXNudCB1bmRlZmluZWQpKVxyXG5cclxuIyBKYXZhc2NyaXB0J3MgbmF0aXZlIGByZXBsYWNlYCByZXBsYWNlcyBvbmx5IGZpcnN0IGluc3RhbmNlcyBvZiBzdWJzdHJpbmdzLlxyXG4jIFJlcGxhY2UgdGhlIGxhc3QgaW5zdGFuY2Ugb2YgYHN1YnN0cmAgaW4gYHN0cmAgd2l0aCBgbmV3U3Vic3RyYC5cclxucmVwbGFjZUxhc3RTdHJpbmcgPSAoc3RyLCB3aGF0LCByZXBsYWNlbWVudCkgLT5cclxuICAgIHBjcyA9IHN0ci5zcGxpdCh3aGF0KTtcclxuICAgIGxhc3RQYyA9IHBjcy5wb3AoKTtcclxuICAgIHJldHVybiBwY3Muam9pbih3aGF0KSArIHJlcGxhY2VtZW50ICsgbGFzdFBjO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBwb2ludGVyXHJcbiIsIiMgIyMgUmVjdXJzaXZlIG1lcmdlIG9mIDIgdHJlZXNcclxuI1xyXG4jIGBgYGpzXHJcbiMgdmFyIGExID0gW3tuYW1lOiAnbjEnLCBkZXNjcmlwdGlvbjogJ2R4J30sIHtuYW1lOiAnbjInfV07XHJcbiMgdmFyIGEyID0gW3tkZXNjcmlwdGlvbjogJ2QxJ30sIHtkZXNjcmlwdGlvbjogJ2QyJ30sIHtkZXNjcmlwdGlvbjogJ2QyJ31dO1xyXG4jXHJcbiMgdHJlZU1lcmdlIChhMSwgYTIpXHJcbiMgLy8gYTEgaXMgbm93XHJcbiMgW3tcIm5hbWVcIjpcIm4xXCIsXCJkZXNjcmlwdGlvblwiOlwiZDFcIn0se1wibmFtZVwiOlwibjJcIixcImRlc2NyaXB0aW9uXCI6XCJkMlwifSx7XCJkZXNjcmlwdGlvblwiOlwiZDJcIn1dXHJcbiNcclxuIyBgYGBcclxuI1xyXG4jIFRoaXMgZG9lcyBub3QgdGFrZSB2YXJpYWJsZSBwYXRocyBpbiBgZGVzdFBhdGhgLiBFZyBpbnN0ZWFkIG9mIGAnKi9rJ2AgeW91IGhhdmUgdG8gZ2l2ZSBgJzEvaydgXHJcblxyXG5wb2ludGVyID0gcmVxdWlyZSAnLi9wb2ludGVyLmNvZmZlZSdcclxuXHJcbnRyZWVNZXJnZSA9IChkZXN0Tm9kZSwgc291cmNlTm9kZSwgZGVzdFBhdGgpIC0+XHJcblx0bWVyZ2UgPSAoZE5vZGUsIHNOb2RlKSAtPlxyXG5cdFx0IyBUaGlzIHdoZW4gYGRlc3RQYXRoYCBwb2ludHMgdG8gYW4gdW5rbm93biBsb2NhdGlvbiFcclxuXHRcdGlmIGROb2RlIGlzIHVuZGVmaW5lZFxyXG5cdFx0XHR0ZXN0S2V5ID0gT2JqZWN0LmtleXMoc05vZGUpWzBdXHJcblxyXG5cdFx0XHQjIGlmIGtleSBpcyBlaXRoZXIgYSBOVW1iZXIgb3IgYSBOVW1iZXIgaW4gYSBzdHJpbmcuXHJcblx0XHRcdCMgRWc6IGAxMmAgb3IgYFwiMjJcImAgb3IgYCcwJ2AgZXRjLlxyXG5cdFx0XHRpZiBpc05hTiBwYXJzZUludCB0ZXN0S2V5IGlzbnQgZmFsc2VcclxuXHRcdFx0XHRkTm9kZSA9IFtdXHJcblxyXG5cdFx0XHRlbHNlXHJcblx0XHRcdFx0ZE5vZGUgPSB7fVxyXG5cclxuXHRcdGZvciBrZXkgb2Ygc05vZGVcclxuXHRcdFx0aWYgKGROb2RlW2tleV0gaXNudCB1bmRlZmluZWQpIGFuZCAodHlwZW9mIGROb2RlW2tleV0gaXMgJ29iamVjdCcpXHJcblx0XHRcdFx0ZE5vZGVba2V5XSA9IG1lcmdlKGROb2RlW2tleV0sIHNOb2RlW2tleV0pXHJcblx0XHRcdGVsc2VcclxuXHRcdFx0XHRkTm9kZVtrZXldID0gc05vZGVba2V5XVxyXG5cdFx0cmV0dXJuIGROb2RlXHJcblxyXG5cdG5vZGUgPSBwb2ludGVyLmdldFZhbHVlIGRlc3ROb2RlLCBkZXN0UGF0aFxyXG5cdG5vZGUgPSBtZXJnZSBub2RlLCBzb3VyY2VOb2RlXHJcblx0cG9pbnRlci5zZXRWYWx1ZSBkZXN0Tm9kZSwgZGVzdFBhdGgsIG5vZGVcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gdHJlZU1lcmdlXHJcbiIsIiMgUmV0dXJucyBhIGBtYXBgIG9iamVjdCB3aGljaCBwbGFjZXMgKnBhdGhzIHRvIGJlIGNoYW5nZWQqIGFzIGtleXMgYW5kICpjaGFuZ2VkIHBhdGhzKiBhcyB2YWx1ZXMuXHJcbiMgR2l2ZW4gYGZyb21QYXRoID0gJyovazMvazQvKi9rNSdgIGFuZCBgdG9QYXRoID0gJyovKi8qL2MzL2M0LyovYzUnYFxyXG4jIHRoaXMgcmV0dXJucyBhIGBtYXBgIG9iamVjdFxyXG4jIGBgYFxyXG4jIFx0bWFwcyA9IHtcclxuIyBcdFx0JyovKi8qL2szJzogJyovKi8qL2MzJyxcclxuIyBcdFx0JyovKi8qL2MzL2s0JzogJyovKi8qL2MzL2M0JyxcclxuIyBcdFx0JyovKi8qL2MzL2M0LyovazUnOiAnKi8qLyovYzMvYzQvKi9jNScsXHJcbiMgXHR9XHJcbiMgYGBgXHJcblxyXG5iZnNUcmFuc2Zvcm0gPSByZXF1aXJlICcuL2Jmcy10cmFuc2Zvcm0uY29mZmVlJ1xyXG5cclxuY3JlYXRlUmVuYW1lTWFwcGluZyA9IChmcm9tUGF0aCwgdG9QYXRoKSAtPlxyXG5cdHRvUGF0aCA9IHRvUGF0aC5zcGxpdCAnLydcclxuXHRmcm9tUGF0aCA9IGZyb21QYXRoLnNwbGl0ICcvJ1xyXG5cdG9mZnNldCA9IHRvUGF0aC5sZW5ndGggLSBmcm9tUGF0aC5sZW5ndGhcclxuXHJcblx0IyBgdG9QYXRoYCBpcyB1c3VhbGx5ID4gYGZyb21QYXRoYC4gU2luY2UgdGhlIHN1YnRyZWUgd2lsbCBiZSBqb2ludCwgd2Ugd2lsbCBuZWVkIHRvIGFwcGVuZCB0aGUgZGlmZmVyZW5jZSB0b1xyXG5cdCMgYGZyb21QYXRoYFxyXG5cdGZyb21QYXRoID0gdG9QYXRoLnNsaWNlKDAsIG9mZnNldCkuY29uY2F0KGZyb21QYXRoKVxyXG5cclxuXHQjIFRoZSB2YXJpYWJsZSB1c2VkIHRvIGhvbGQgdGhlIHJldHVybiB2YWx1ZS5cclxuXHRtYXAgPSB7fVxyXG5cdGZvciBwYXRoLCBpIGluIHRvUGF0aFxyXG5cdFx0aWYgKHRvUGF0aFtpXSBpc250ICcqJykgYW5kICh0b1BhdGhbaV0gaXNudCBmcm9tUGF0aFtpXSlcclxuXHRcdFx0bWFwW2Zyb21QYXRoLnNsaWNlKDAsIGkgKyAxKS5qb2luKCcvJyldID0gdG9QYXRoLnNsaWNlKDAsaSArIDEpLmpvaW4oJy8nKVxyXG5cdFx0XHRmcm9tUGF0aFtpXSA9IHRvUGF0aFtpXVxyXG5cdFx0ZWxzZVxyXG5cdFx0XHRjb250aW51ZVxyXG5cdHJldHVybiBtYXBcclxuXHJcbnRyZWVSZW5hbWUgPSAoZGVzdE9iaiwgc291cmNlT2JqLCByZW5hbWVNYXBzKSAtPlxyXG5cdG1hcCA9IHt9XHJcblx0Zm9yIHNvdXJjZVBhdGgsIGRlc3RQYXRoIG9mIHJlbmFtZU1hcHNcclxuXHRcdG1hcCA9IF8uZXh0ZW5kIG1hcCwgY3JlYXRlUmVuYW1lTWFwcGluZyBzb3VyY2VQYXRoLCBkZXN0UGF0aFxyXG5cclxuXHR0cmFuc2Zvcm1zID0ge31cclxuXHRmb3IgZnJvbVBhdGgsIHRvUGF0aCBvZiBtYXBcclxuXHRcdHRyYW5zZm9ybXNbZnJvbVBhdGhdID0gKCh0b1BhdGgsIGZyb21QYXRoKSAtPlxyXG5cclxuXHRcdFx0IyBzbGljZSgpIGFuZCBwb3AoKSBHZXQgdGhlIGxhc3QgcGF0aCBwb2ludGVyIC8ga2V5XHJcblx0XHRcdCMgaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMTIwOTkzNDFcclxuXHRcdFx0dG9LZXkgPSB0b1BhdGguc3BsaXQoJy8nKS5wb3AoKVxyXG5cdFx0XHRmcm9tS2V5ID0gZnJvbVBhdGguc3BsaXQoJy8nKS5wb3AoKVxyXG5cclxuXHRcdFx0cmV0dXJuIChub2RlLCBwYXJlbnQpIC0+XHJcblx0XHRcdFx0aWYgcGFyZW50LnZhbHVlW2Zyb21LZXldIGlzbnQgdW5kZWZpbmVkXHJcblx0XHRcdFx0XHRwYXJlbnQudmFsdWVbdG9LZXldID0gcGFyZW50LnZhbHVlW2Zyb21LZXldXHJcblx0XHRcdFx0XHRjb25zb2xlLmxvZyAnZGVsZXRpbmcnLCBwYXJlbnQudmFsdWVbZnJvbUtleV1cclxuXHRcdFx0XHRcdGRlbGV0ZSBwYXJlbnQudmFsdWVbZnJvbUtleV1cclxuXHJcblx0XHRcdFx0bm9kZS5wYXRoID0gcmVwbGFjZUxhc3RTdHJpbmcobm9kZS5wYXRoLCAnLycgKyBmcm9tS2V5LCAnLycgKyB0b0tleSlcclxuXHJcblx0XHRcdFx0cmV0dXJuIHtcclxuXHRcdFx0XHRcdG5vZGU6IG5vZGVcclxuXHRcdFx0XHRcdHBhcmVudDogcGFyZW50XHJcblx0XHRcdFx0fSkodG9QYXRoLCBmcm9tUGF0aClcclxuXHJcblx0XHRiZnNUcmFuc2Zvcm0gZGVzdE9iaiwgdHJhbnNmb3Jtc1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB0cmVlUmVuYW1lXHJcbiJdfQ==
