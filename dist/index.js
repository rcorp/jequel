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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmNcXGJmcy10cmFuc2Zvcm0uY29mZmVlIiwic3JjXFxpbmRleC5jb2ZmZWUiLCJzcmNcXHBvaW50ZXIuY29mZmVlIiwic3JjXFx0cmVlLW1lcmdlLmNvZmZlZSIsInNyY1xcdHJlZS1yZW5hbWUuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDRUEsSUFBQTs7QUFBQSxZQUFBLEdBQWUsU0FBQyxHQUFELEVBQU0sVUFBTjtBQUdkLE1BQUE7RUFBQSxJQUFBLEdBQU87SUFBQyxLQUFBLEVBQU8sR0FBUjtJQUFhLElBQUEsRUFBTSxFQUFuQjs7QUFDUCxPQUFBLDJCQUFBOztJQUNDLElBQUcsT0FBTyxDQUFDLGNBQVIsQ0FBdUIsYUFBdkIsRUFBc0MsRUFBdEMsQ0FBSDtNQUNDLElBQUEsR0FBTyxpQkFBQSxDQUFrQixJQUFsQixDQUF1QixDQUFDLEtBRGhDOztBQUREO0VBS0EsQ0FBQSxHQUFJLENBQUMsSUFBRDtBQUNKLFNBQU0sQ0FBQyxDQUFDLE1BQUYsS0FBYyxDQUFwQjtJQUdDLFVBQUEsR0FBYSxDQUFDLENBQUMsS0FBRixDQUFBO0lBQ2IsSUFBQSxHQUFPO0lBRVAsSUFBRyxPQUFPLFVBQVUsQ0FBQyxLQUFsQixLQUEyQixRQUE5QjtBQUNDO0FBQUEsV0FBQSxVQUFBOztRQUNDLElBQUksQ0FBQyxJQUFMLEdBQWUsVUFBVSxDQUFDLElBQWQsR0FBd0IsVUFBVSxDQUFDLElBQVgsR0FBa0IsR0FBbEIsR0FBd0IsR0FBaEQsR0FBeUQ7UUFDckUsSUFBSSxDQUFDLEtBQUwsR0FBYTtBQU9iLGFBQUEsMkJBQUE7O1VBQ0MsSUFBRyxPQUFPLENBQUMsY0FBUixDQUF1QixhQUF2QixFQUFzQyxJQUFJLENBQUMsSUFBM0MsQ0FBSDtZQUNDLFFBQUEsR0FBVyxpQkFBQSxDQUFrQixJQUFsQixFQUF3QjtjQUFDLElBQUEsRUFBTSxVQUFVLENBQUMsSUFBbEI7Y0FB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LE1BQU0sQ0FBQyxLQUFNLENBQUEsT0FBQSxDQUFiLEtBQTJCLE1BQTlCO1VBQ0MsTUFBTSxDQUFDLEtBQU0sQ0FBQSxLQUFBLENBQWIsR0FBc0IsTUFBTSxDQUFDLEtBQU0sQ0FBQSxPQUFBO1VBQ25DLE9BQU8sQ0FBQyxHQUFSLENBQVksVUFBWixFQUF3QixNQUFNLENBQUMsS0FBTSxDQUFBLE9BQUEsQ0FBckM7VUFDQSxPQUFPLE1BQU0sQ0FBQyxLQUFNLENBQUEsT0FBQSxFQUhyQjs7UUFLQSxJQUFJLENBQUMsSUFBTCxHQUFZLGlCQUFBLENBQWtCLElBQUksQ0FBQyxJQUF2QixFQUE2QixHQUFBLEdBQU0sT0FBbkMsRUFBNEMsR0FBQSxHQUFNLEtBQWxEO0FBRVosZUFBTztVQUNOLElBQUEsRUFBTSxJQURBO1VBRU4sTUFBQSxFQUFRLE1BRkY7O01BUkQ7SUFQZ0IsQ0FBRCxDQUFBLENBa0JsQixNQWxCa0IsRUFrQlYsUUFsQlU7aUJBb0J2QixZQUFBLENBQWEsT0FBYixFQUFzQixVQUF0QjtBQXJCRDs7QUFOWTs7QUE2QmIsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiIyAjIyBCRlMgVHJhbnNmb3JtZXJcclxuXHJcbmJmc1RyYW5zZm9ybSA9IChvYmosIHRyYW5zZm9ybXMpLT5cclxuXHJcblx0IyBDaGVjayBpZiBhbnkgdHJhbnNmb3JtcyBtYXRjaCB0aGUgcm9vdCBub2RlIHdoaWNoIGhhcyBhIHBhdGggYCcnYC5cclxuXHRyb290ID0ge3ZhbHVlOiBvYmosIHBhdGg6ICcnfVxyXG5cdGZvciB0cmFuc2Zvcm1QYXRoLCB0cmFuc2Zvcm1GdW5jdGlvbiBvZiB0cmFuc2Zvcm1zXHJcblx0XHRpZiBwb2ludGVyLmlzTWF0Y2hpbmdQYXRoIHRyYW5zZm9ybVBhdGgsICcnXHJcblx0XHRcdHJvb3QgPSB0cmFuc2Zvcm1GdW5jdGlvbihyb290KS5ub2RlXHJcblxyXG5cdCMgSW5pdGlhbGlzZSBhIFF1ZXVlIERhdGEgU3RydWN0dXJlIGFuZCBob2xkIHRoZSByb290IE9iamVjdFxyXG5cdHEgPSBbcm9vdF1cclxuXHR3aGlsZSBxLmxlbmd0aCBpc250IDBcclxuXHJcblx0XHQjIFRoaXMgaXMgdGhlIHBhcmVudCBub2RlIGJlaW5nIHBvcHBlZCBvdXQgb2YgdGhlIFF1ZXVlLlxyXG5cdFx0cGFyZW50Tm9kZSA9IHEuc2hpZnQoKVxyXG5cdFx0bm9kZSA9IHt9XHJcblxyXG5cdFx0aWYgdHlwZW9mIHBhcmVudE5vZGUudmFsdWUgaXMgJ29iamVjdCdcclxuXHRcdFx0Zm9yIGtleSwgbm9kZVZhbHVlIG9mIHBhcmVudE5vZGUudmFsdWVcclxuXHRcdFx0XHRub2RlLnBhdGggPSBpZiBwYXJlbnROb2RlLnBhdGggdGhlbiBwYXJlbnROb2RlLnBhdGggKyAnLycgKyBrZXkgZWxzZSBrZXlcclxuXHRcdFx0XHRub2RlLnZhbHVlID0gbm9kZVZhbHVlXHJcblxyXG5cdFx0XHRcdCMgTm93IGxvb3Agb3ZlciBhbGwgdGhlIHRyYW5zZm9ybXMgZ2l2ZW4gdG8gdXMgaW4gYHRyYW5zZm9ybXNgLiBBIG1vcmUgZWZmaWNpZW50IHNvbHV0aW9uXHJcblx0XHRcdFx0IyBsYXRlciB3b3VsZCBiZSB0byBrZWVwIHRyYWNrIG9mIHRoZSBsZXZlbCBkZXB0aCBvZiB0aGUgQkZTIGFuZCBvbmx5IGV4ZWN1dGUgdGhvc2VcclxuXHRcdFx0XHQjIHRyYW5zZm9ybWF0aW9ucyBvZiB0aGUgY3VycmVudCBsZXZlbC5cclxuXHRcdFx0XHQjXHJcblx0XHRcdFx0IyBFZzogYCovKi8qYCBzaG91bGQgbm90IGJlIHRyYW5zZm9ybWVkIHVudGlsIGF0IGxlYXN0IEJGUyBoYXMgZ29uZSAzIGxldmVzIGRvd24uXHJcblx0XHRcdFx0Zm9yIHRyYW5zZm9ybVBhdGgsIHRyYW5zZm9ybUZ1bmN0aW9uIG9mIHRyYW5zZm9ybXNcclxuXHRcdFx0XHRcdGlmIHBvaW50ZXIuaXNNYXRjaGluZ1BhdGggdHJhbnNmb3JtUGF0aCwgbm9kZS5wYXRoXHJcblx0XHRcdFx0XHRcdG5ld05vZGVzID0gdHJhbnNmb3JtRnVuY3Rpb24gbm9kZSwge3BhdGg6IHBhcmVudE5vZGUucGF0aCwgdmFsdWU6IHBhcmVudE5vZGUudmFsdWV9XHJcblx0XHRcdFx0XHRcdG5vZGUgPSBuZXdOb2Rlcy5ub2RlXHJcblx0XHRcdFx0cS5wdXNoIHtwYXRoOiBub2RlLnBhdGgsIHZhbHVlOiBub2RlLnZhbHVlfVxyXG5cdHJldHVybiBvYmpcclxubW9kdWxlLmV4cG9ydHMgPSBiZnNUcmFuc2Zvcm1cclxuIiwibW9kdWxlLmV4cG9ydHMgPSBcclxuICAgICdiZnNUcmFuc2Zvcm0nOiByZXF1aXJlICgnLi9iZnMtdHJhbnNmb3JtLmNvZmZlZScpXHJcbiAgICAncG9pbnRlcic6IHJlcXVpcmUoJy4vcG9pbnRlci5jb2ZmZWUnKVxyXG4gICAgJ3RyZWUtbWVyZ2UnOiByZXF1aXJlKCcuL3RyZWUtbWVyZ2UuY29mZmVlJylcclxuICAgICd0cmVlLXJlbmFtZSc6IHJlcXVpcmUoJy4vdHJlZS1yZW5hbWUuY29mZmVlJykiLCIjICMjIEpTT04gUG9pbnRlciBPcGVyYXRpb25zXHJcblxyXG5wb2ludGVyID0ge31cclxuXHJcbiMgVXNlZCB0byBpbnNlcnQgYSBzcGVjaWZpYyB2YWx1ZSAoYHZhbGApIGF0IGEgc3BlY2lmaWMgcGF0aCAoYHBhdGhgKSBpbiBhIGdpdmVuIEpTT04gT2JqZWN0IChgb2JqYClcclxucG9pbnRlci5zZXRWYWx1ZSA9IChvYmosIHBhdGgsIHZhbCkgLT5cclxuXHRkZXN0UGF0aCA9ICdvYmonXHJcblx0Zm9yIHAgaW4gcGF0aC5zcGxpdCAnLydcclxuXHJcblx0XHQjIEluIGNhc2UgcGF0aCBkb2VzbnQgaGF2ZSBhIGAvYFxyXG5cdFx0ZGVzdFBhdGggKz0gXCJbJyN7cH0nXVwiIGlmIHAgaXNudCBcIlwiXHJcblx0ZXZhbCBkZXN0UGF0aCArICc9dmFsJ1xyXG5cdHJldHVybiBvYmpcclxuXHJcbiMgVXNlZCB0byByZXR1cm4gdGhlIHZhbHVlIGF0IGEgc3BlY2lmaWMgcGF0aCAoYHBhdGhgKSBpbiBhIGdpdmVuIEpTT04gT2JqZWN0IChgb2JqYClcclxucG9pbnRlci5nZXRWYWx1ZSA9IChvYmosIHBhdGgpIC0+XHJcblx0ZGVzdFBhdGggPSAnb2JqJ1xyXG5cdGZvciBwIGluIHBhdGguc3BsaXQgJy8nXHJcblxyXG5cdFx0IyBJbiBjYXNlIHBhdGggZG9lc250IGhhdmUgYSBgL2BcclxuXHRcdGRlc3RQYXRoICs9IFwiWycje3B9J11cIiBpZiBwIGlzbnQgXCJcIlxyXG5cclxuXHQjIFdvb3BzISBXZSBoYXZlIHRvIHJlbW92ZSBldmFsIGluIHRoaXMhXHJcblx0cmV0dXJuIGV2YWwgZGVzdFBhdGhcclxuXHJcbiMgVXNlZCB0byBtYXRjaCAyIGR5bmFtaWMgSlNPTiBQb2ludGVyc1xyXG5wb2ludGVyLmlzTWF0Y2hpbmdQYXRoID0gKHBhdGgxLCBwYXRoMikgLT5cclxuXHRwYXRoMSA9IHBhdGgxLnNwbGl0ICcvJ1xyXG5cdHBhdGgyID0gcGF0aDIuc3BsaXQgJy8nXHJcblx0aWYgcGF0aDIubGVuZ3RoID4gcGF0aDEubGVuZ3RoXHJcblx0XHRbcGF0aDIsIHBhdGgxXSA9IFtwYXRoMSwgcGF0aDJdXHJcblx0cGF0aDEuZXZlcnkgKGVsLCBpbmRleCkgLT5cclxuXHRcdCgocGF0aDJbaW5kZXhdIGlzICcqJykgb3IgKHBhdGgyW2luZGV4XSBpcyBlbCkgb3IgKGVsIGlzICcqJykpIGFuZCAoKGVsIGlzbnQgdW5kZWZpbmVkKSBhbmQgKHBhdGgyW2luZGV4XSBpc250IHVuZGVmaW5lZCkpXHJcblxyXG4jIEphdmFzY3JpcHQncyBuYXRpdmUgYHJlcGxhY2VgIHJlcGxhY2VzIG9ubHkgZmlyc3QgaW5zdGFuY2VzIG9mIHN1YnN0cmluZ3MuXHJcbiMgUmVwbGFjZSB0aGUgbGFzdCBpbnN0YW5jZSBvZiBgc3Vic3RyYCBpbiBgc3RyYCB3aXRoIGBuZXdTdWJzdHJgLlxyXG5yZXBsYWNlTGFzdFN0cmluZyA9IChzdHIsIHdoYXQsIHJlcGxhY2VtZW50KSAtPlxyXG4gICAgcGNzID0gc3RyLnNwbGl0KHdoYXQpO1xyXG4gICAgbGFzdFBjID0gcGNzLnBvcCgpO1xyXG4gICAgcmV0dXJuIHBjcy5qb2luKHdoYXQpICsgcmVwbGFjZW1lbnQgKyBsYXN0UGM7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHBvaW50ZXJcclxuIiwiIyAjIyBSZWN1cnNpdmUgbWVyZ2Ugb2YgMiB0cmVlc1xyXG4jXHJcbiMgYGBganNcclxuIyB2YXIgYTEgPSBbe25hbWU6ICduMScsIGRlc2NyaXB0aW9uOiAnZHgnfSwge25hbWU6ICduMid9XTtcclxuIyB2YXIgYTIgPSBbe2Rlc2NyaXB0aW9uOiAnZDEnfSwge2Rlc2NyaXB0aW9uOiAnZDInfSwge2Rlc2NyaXB0aW9uOiAnZDInfV07XHJcbiNcclxuIyB0cmVlTWVyZ2UgKGExLCBhMilcclxuIyAvLyBhMSBpcyBub3dcclxuIyBbe1wibmFtZVwiOlwibjFcIixcImRlc2NyaXB0aW9uXCI6XCJkMVwifSx7XCJuYW1lXCI6XCJuMlwiLFwiZGVzY3JpcHRpb25cIjpcImQyXCJ9LHtcImRlc2NyaXB0aW9uXCI6XCJkMlwifV1cclxuI1xyXG4jIGBgYFxyXG4jXHJcbiMgVGhpcyBkb2VzIG5vdCB0YWtlIHZhcmlhYmxlIHBhdGhzIGluIGBkZXN0UGF0aGAuIEVnIGluc3RlYWQgb2YgYCcqL2snYCB5b3UgaGF2ZSB0byBnaXZlIGAnMS9rJ2BcclxuXHJcbnBvaW50ZXIgPSByZXF1aXJlICcuL3BvaW50ZXIuY29mZmVlJ1xyXG5cclxudHJlZU1lcmdlID0gKGRlc3ROb2RlLCBzb3VyY2VOb2RlLCBkZXN0UGF0aCkgLT5cclxuXHRtZXJnZSA9IChkTm9kZSwgc05vZGUpIC0+XHJcblx0XHQjIFRoaXMgd2hlbiBgZGVzdFBhdGhgIHBvaW50cyB0byBhbiB1bmtub3duIGxvY2F0aW9uIVxyXG5cdFx0aWYgZE5vZGUgaXMgdW5kZWZpbmVkXHJcblx0XHRcdHRlc3RLZXkgPSBPYmplY3Qua2V5cyhzTm9kZSlbMF1cclxuXHJcblx0XHRcdCMgaWYga2V5IGlzIGVpdGhlciBhIE5VbWJlciBvciBhIE5VbWJlciBpbiBhIHN0cmluZy5cclxuXHRcdFx0IyBFZzogYDEyYCBvciBgXCIyMlwiYCBvciBgJzAnYCBldGMuXHJcblx0XHRcdGlmIGlzTmFOIHBhcnNlSW50IHRlc3RLZXkgaXNudCBmYWxzZVxyXG5cdFx0XHRcdGROb2RlID0gW11cclxuXHJcblx0XHRcdGVsc2VcclxuXHRcdFx0XHRkTm9kZSA9IHt9XHJcblxyXG5cdFx0Zm9yIGtleSBvZiBzTm9kZVxyXG5cdFx0XHRpZiAoZE5vZGVba2V5XSBpc250IHVuZGVmaW5lZCkgYW5kICh0eXBlb2YgZE5vZGVba2V5XSBpcyAnb2JqZWN0JylcclxuXHRcdFx0XHRkTm9kZVtrZXldID0gbWVyZ2UoZE5vZGVba2V5XSwgc05vZGVba2V5XSlcclxuXHRcdFx0ZWxzZVxyXG5cdFx0XHRcdGROb2RlW2tleV0gPSBzTm9kZVtrZXldXHJcblx0XHRyZXR1cm4gZE5vZGVcclxuXHJcblx0bm9kZSA9IHBvaW50ZXIuZ2V0VmFsdWUgZGVzdE5vZGUsIGRlc3RQYXRoXHJcblx0bm9kZSA9IG1lcmdlIG5vZGUsIHNvdXJjZU5vZGVcclxuXHRwb2ludGVyLnNldFZhbHVlIGRlc3ROb2RlLCBkZXN0UGF0aCwgbm9kZVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB0cmVlTWVyZ2VcclxuIiwiIyBSZXR1cm5zIGEgYG1hcGAgb2JqZWN0IHdoaWNoIHBsYWNlcyAqcGF0aHMgdG8gYmUgY2hhbmdlZCogYXMga2V5cyBhbmQgKmNoYW5nZWQgcGF0aHMqIGFzIHZhbHVlcy5cclxuIyBHaXZlbiBgZnJvbVBhdGggPSAnKi9rMy9rNC8qL2s1J2AgYW5kIGB0b1BhdGggPSAnKi8qLyovYzMvYzQvKi9jNSdgXHJcbiMgdGhpcyByZXR1cm5zIGEgYG1hcGAgb2JqZWN0XHJcbiMgYGBgXHJcbiMgXHRtYXBzID0ge1xyXG4jIFx0XHQnKi8qLyovazMnOiAnKi8qLyovYzMnLFxyXG4jIFx0XHQnKi8qLyovYzMvazQnOiAnKi8qLyovYzMvYzQnLFxyXG4jIFx0XHQnKi8qLyovYzMvYzQvKi9rNSc6ICcqLyovKi9jMy9jNC8qL2M1JyxcclxuIyBcdH1cclxuIyBgYGBcclxuXHJcbmJmc1RyYW5zZm9ybSA9IHJlcXVpcmUgJy4vYmZzLXRyYW5zZm9ybS5jb2ZmZWUnXHJcblxyXG5jcmVhdGVSZW5hbWVNYXBwaW5nID0gKGZyb21QYXRoLCB0b1BhdGgpIC0+XHJcblx0dG9QYXRoID0gdG9QYXRoLnNwbGl0ICcvJ1xyXG5cdGZyb21QYXRoID0gZnJvbVBhdGguc3BsaXQgJy8nXHJcblx0b2Zmc2V0ID0gdG9QYXRoLmxlbmd0aCAtIGZyb21QYXRoLmxlbmd0aFxyXG5cclxuXHQjIGB0b1BhdGhgIGlzIHVzdWFsbHkgPiBgZnJvbVBhdGhgLiBTaW5jZSB0aGUgc3VidHJlZSB3aWxsIGJlIGpvaW50LCB3ZSB3aWxsIG5lZWQgdG8gYXBwZW5kIHRoZSBkaWZmZXJlbmNlIHRvXHJcblx0IyBgZnJvbVBhdGhgXHJcblx0ZnJvbVBhdGggPSB0b1BhdGguc2xpY2UoMCwgb2Zmc2V0KS5jb25jYXQoZnJvbVBhdGgpXHJcblxyXG5cdCMgVGhlIHZhcmlhYmxlIHVzZWQgdG8gaG9sZCB0aGUgcmV0dXJuIHZhbHVlLlxyXG5cdG1hcCA9IHt9XHJcblx0Zm9yIHBhdGgsIGkgaW4gdG9QYXRoXHJcblx0XHRpZiAodG9QYXRoW2ldIGlzbnQgJyonKSBhbmQgKHRvUGF0aFtpXSBpc250IGZyb21QYXRoW2ldKVxyXG5cdFx0XHRtYXBbZnJvbVBhdGguc2xpY2UoMCwgaSArIDEpLmpvaW4oJy8nKV0gPSB0b1BhdGguc2xpY2UoMCxpICsgMSkuam9pbignLycpXHJcblx0XHRcdGZyb21QYXRoW2ldID0gdG9QYXRoW2ldXHJcblx0XHRlbHNlXHJcblx0XHRcdGNvbnRpbnVlXHJcblx0cmV0dXJuIG1hcFxyXG5cclxudHJlZVJlbmFtZSA9IChkZXN0T2JqLCBzb3VyY2VPYmosIHJlbmFtZU1hcHMpIC0+XHJcblx0bWFwID0ge31cclxuXHRmb3Igc291cmNlUGF0aCwgZGVzdFBhdGggb2YgcmVuYW1lTWFwc1xyXG5cdFx0bWFwID0gXy5leHRlbmQgbWFwLCBjcmVhdGVSZW5hbWVNYXBwaW5nIHNvdXJjZVBhdGgsIGRlc3RQYXRoXHJcblxyXG5cdHRyYW5zZm9ybXMgPSB7fVxyXG5cdGZvciBmcm9tUGF0aCwgdG9QYXRoIG9mIG1hcFxyXG5cdFx0dHJhbnNmb3Jtc1tmcm9tUGF0aF0gPSAoKHRvUGF0aCwgZnJvbVBhdGgpIC0+XHJcblxyXG5cdFx0XHQjIHNsaWNlKCkgYW5kIHBvcCgpIEdldCB0aGUgbGFzdCBwYXRoIHBvaW50ZXIgLyBrZXlcclxuXHRcdFx0IyBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8xMjA5OTM0MVxyXG5cdFx0XHR0b0tleSA9IHRvUGF0aC5zcGxpdCgnLycpLnBvcCgpXHJcblx0XHRcdGZyb21LZXkgPSBmcm9tUGF0aC5zcGxpdCgnLycpLnBvcCgpXHJcblxyXG5cdFx0XHRyZXR1cm4gKG5vZGUsIHBhcmVudCkgLT5cclxuXHRcdFx0XHRpZiBwYXJlbnQudmFsdWVbZnJvbUtleV0gaXNudCB1bmRlZmluZWRcclxuXHRcdFx0XHRcdHBhcmVudC52YWx1ZVt0b0tleV0gPSBwYXJlbnQudmFsdWVbZnJvbUtleV1cclxuXHRcdFx0XHRcdGNvbnNvbGUubG9nICdkZWxldGluZycsIHBhcmVudC52YWx1ZVtmcm9tS2V5XVxyXG5cdFx0XHRcdFx0ZGVsZXRlIHBhcmVudC52YWx1ZVtmcm9tS2V5XVxyXG5cclxuXHRcdFx0XHRub2RlLnBhdGggPSByZXBsYWNlTGFzdFN0cmluZyhub2RlLnBhdGgsICcvJyArIGZyb21LZXksICcvJyArIHRvS2V5KVxyXG5cclxuXHRcdFx0XHRyZXR1cm4ge1xyXG5cdFx0XHRcdFx0bm9kZTogbm9kZVxyXG5cdFx0XHRcdFx0cGFyZW50OiBwYXJlbnRcclxuXHRcdFx0XHR9KSh0b1BhdGgsIGZyb21QYXRoKVxyXG5cclxuXHRcdGJmc1RyYW5zZm9ybSBkZXN0T2JqLCB0cmFuc2Zvcm1zXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHRyZWVSZW5hbWVcclxuIl19
