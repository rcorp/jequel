(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    return (function () {
        function Jequel(jsonObj) {
            this.from = {};
            this.select = {};
            this.results = {};
            this.json = jsonObj;
            this.results = this.json;
        }
        Jequel.prototype.Select = function (selectPath) {
            this.selectResults = this.bfs(selectPath, this.results);
            this.results = this.selectResults;
            return this;
        };
        Jequel.prototype.MultiSelect = function (selectPaths) {
            var _this = this;
            selectPaths = selectPaths instanceof Array ? selectPaths : [selectPaths];
            this.selectResults = selectPaths.map(function (selectPath) {
                return _this.bfs(selectPath, _this.results);
            });
            this.results = this.selectResults;
            return this;
        };
        Jequel.prototype.SequentialTransformer = function (cb) {
            var results = this.results;
            var l = Math.max.apply(null, results.map(function (r) { return r.length; }));
            for (var i = 0; i < l; i++) {
                var args = [];
                for (var j = 0; j < results.length; j++) {
                    args.push(results[j][i]);
                }
                args = cb(args);
            }
            return results;
        };
        Jequel.prototype.Where = function (whereConditions) {
            var _this = this;
            this.results = this.results.filter(function (result) {
                return whereConditions.every(function (whereCondition) {
                    return _this.bfs(whereCondition.path, result).some(function (val) {
                        return JSON.stringify(val) == JSON.stringify(whereCondition.value);
                    });
                });
            });
            return this;
        };
        Jequel.prototype.query = function (_a) {
            var _this = this;
            var select = _a.select, from = _a.from, where = _a.where;
            this.select = select;
            this.from = from;
            this.where = where;
            var selectResults = this.selected = this.bfs(this.select, this.from);
            if (this.where)
                return selectResults.filter(function (selectResult) {
                    return _this.where.every(function (where) {
                        return _this.bfs(where.path, selectResult).some(function (val) {
                            return (JSON.stringify(val) == JSON.stringify(where.value));
                        });
                    });
                });
            else
                return selectResults;
        };
        Jequel.prototype.bfs = function (path, obj) {
            var _this = this;
            obj = [obj];
            path.split('.').map(function (key) { return obj = _this.bfsTraverse(key, obj); });
            return obj;
        };
        Jequel.prototype.bfsTraverse = function (key, obj) {
            var _this = this;
            var data = [];
            obj.forEach(function (x) {
                if (x instanceof Array)
                    if (key == '*')
                        data = data.concat(x);
                    else
                        data.push(x[key]);
                else if (typeof x == 'object')
                    if (key == '*')
                        data = data.concat(_this._getValues(x));
                    else
                        data.push(x[key]);
            });
            return data;
        };
        Jequel.prototype._getValues = function (myObject) {
            return Object.keys(myObject).map(function (key) {
                return myObject[key];
            });
        };
        return Jequel;
    })();
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSmVxdWVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiSmVxdWVsLnRzIl0sIm5hbWVzIjpbImNvbnN0cnVjdG9yIiwiU2VsZWN0IiwiTXVsdGlTZWxlY3QiLCJTZXF1ZW50aWFsVHJhbnNmb3JtZXIiLCJXaGVyZSIsInF1ZXJ5IiwiYmZzIiwiYmZzVHJhdmVyc2UiLCJfZ2V0VmFsdWVzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7OztJQUFBLE9BQVM7UUFJTCxnQkFBYSxPQUFPO1lBSHBCQSxTQUFJQSxHQUFHQSxFQUFFQSxDQUFBQTtZQUNUQSxXQUFNQSxHQUFHQSxFQUFFQSxDQUFBQTtZQUNYQSxZQUFPQSxHQUFHQSxFQUFFQSxDQUFBQTtZQUVSQSxJQUFJQSxDQUFDQSxJQUFJQSxHQUFHQSxPQUFPQSxDQUFBQTtZQUNuQkEsSUFBSUEsQ0FBQ0EsT0FBT0EsR0FBR0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQUE7UUFDNUJBLENBQUNBO1FBRUQsdUJBQU0sR0FBTixVQUFRLFVBQVU7WUFDZEMsSUFBSUEsQ0FBQ0EsYUFBYUEsR0FBR0EsSUFBSUEsQ0FBQ0EsR0FBR0EsQ0FBRUEsVUFBVUEsRUFBRUEsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQUE7WUFDeERBLElBQUlBLENBQUNBLE9BQU9BLEdBQUdBLElBQUlBLENBQUNBLGFBQWFBLENBQUFBO1lBQ2pDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFBQTtRQUNmQSxDQUFDQTtRQUVELDRCQUFXLEdBQVgsVUFBYSxXQUFXO1lBQXhCQyxpQkFNQ0E7WUFMR0EsV0FBV0EsR0FBR0EsV0FBV0EsWUFBWUEsS0FBS0EsR0FBR0EsV0FBV0EsR0FBRUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQUE7WUFDdkVBLElBQUlBLENBQUNBLGFBQWFBLEdBQUdBLFdBQVdBLENBQUNBLEdBQUdBLENBQUNBLFVBQUFBLFVBQVVBO3VCQUMzQ0EsS0FBSUEsQ0FBQ0EsR0FBR0EsQ0FBRUEsVUFBVUEsRUFBRUEsS0FBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0E7WUFBbkNBLENBQW1DQSxDQUFDQSxDQUFBQTtZQUN4Q0EsSUFBSUEsQ0FBQ0EsT0FBT0EsR0FBR0EsSUFBSUEsQ0FBQ0EsYUFBYUEsQ0FBQUE7WUFDakNBLE1BQU1BLENBQUNBLElBQUlBLENBQUFBO1FBQ2ZBLENBQUNBO1FBZUQsc0NBQXFCLEdBQXJCLFVBQXVCLEVBQUU7WUFDckJDLElBQUlBLE9BQU9BLEdBQUdBLElBQUlBLENBQUNBLE9BQU9BLENBQUFBO1lBRzFCQSxJQUFJQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQSxHQUFHQSxDQUFDQSxLQUFLQSxDQUFDQSxJQUFJQSxFQUFFQSxPQUFPQSxDQUFDQSxHQUFHQSxDQUFDQSxVQUFBQSxDQUFDQSxJQUFJQSxPQUFBQSxDQUFDQSxDQUFDQSxNQUFNQSxFQUFSQSxDQUFRQSxDQUFDQSxDQUFDQSxDQUFBQTtZQUd4REEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsRUFBR0EsRUFBQ0EsQ0FBQ0E7Z0JBQ3pCQSxJQUFJQSxJQUFJQSxHQUFHQSxFQUFFQSxDQUFBQTtnQkFFYkEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsR0FBR0EsT0FBT0EsQ0FBQ0EsTUFBTUEsRUFBRUEsQ0FBQ0EsRUFBRUEsRUFBQ0EsQ0FBQ0E7b0JBQ3JDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFBQTtnQkFDNUJBLENBQUNBO2dCQUVEQSxJQUFJQSxHQUFHQSxFQUFFQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFBQTtZQUduQkEsQ0FBQ0E7WUFDREEsTUFBTUEsQ0FBQ0EsT0FBT0EsQ0FBQUE7UUFDbEJBLENBQUNBO1FBR0Qsc0JBQUssR0FBTCxVQUFPLGVBQWU7WUFBdEJDLGlCQVNDQTtZQVJHQSxJQUFJQSxDQUFDQSxPQUFPQSxHQUFHQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxNQUFNQSxDQUFDQSxVQUFBQSxNQUFNQTt1QkFDckNBLGVBQWVBLENBQUNBLEtBQUtBLENBQUNBLFVBQUFBLGNBQWNBOzJCQUNoQ0EsS0FBSUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsY0FBY0EsQ0FBQ0EsSUFBSUEsRUFBRUEsTUFBTUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsVUFBQUEsR0FBR0E7K0JBQzFDQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxHQUFHQSxDQUFDQSxJQUFJQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxjQUFjQSxDQUFDQSxLQUFLQSxDQUFDQTtvQkFBM0RBLENBQTJEQSxDQUM5REE7Z0JBRkRBLENBRUNBLENBQ0pBO1lBSkRBLENBSUNBLENBQ0pBLENBQUFBO1lBQ0RBLE1BQU1BLENBQUNBLElBQUlBLENBQUFBO1FBQ2ZBLENBQUNBO1FBRUQsc0JBQUssR0FBTCxVQUFPLEVBQXFCO1lBQTVCQyxpQkFnQkNBO2dCQWhCT0EsTUFBTUEsY0FBRUEsSUFBSUEsWUFBRUEsS0FBS0E7WUFDdkJBLElBQUlBLENBQUNBLE1BQU1BLEdBQUdBLE1BQU1BLENBQUFBO1lBQ3BCQSxJQUFJQSxDQUFDQSxJQUFJQSxHQUFHQSxJQUFJQSxDQUFBQTtZQUNoQkEsSUFBSUEsQ0FBQ0EsS0FBS0EsR0FBR0EsS0FBS0EsQ0FBQUE7WUFFbEJBLElBQUlBLGFBQWFBLEdBQUdBLElBQUlBLENBQUNBLFFBQVFBLEdBQUdBLElBQUlBLENBQUNBLEdBQUdBLENBQUVBLElBQUlBLENBQUNBLE1BQU1BLEVBQUVBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLENBQUFBO1lBQ3JFQSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQTtnQkFDWEEsTUFBTUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsVUFBQUEsWUFBWUE7b0JBQ3BDQSxNQUFNQSxDQUFDQSxLQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxLQUFLQSxDQUFDQSxVQUFBQSxLQUFLQTt3QkFDekJBLE1BQU1BLENBQUNBLEtBQUlBLENBQUNBLEdBQUdBLENBQUNBLEtBQUtBLENBQUNBLElBQUlBLEVBQUVBLFlBQVlBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLFVBQUFBLEdBQUdBOzRCQUM5Q0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsSUFBSUEsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQUE7d0JBQy9EQSxDQUFDQSxDQUFDQSxDQUFBQTtvQkFDTkEsQ0FBQ0EsQ0FBQ0EsQ0FBQUE7Z0JBQ05BLENBQUNBLENBQUNBLENBQUFBO1lBQ05BLElBQUlBO2dCQUNBQSxNQUFNQSxDQUFDQSxhQUFhQSxDQUFBQTtRQUM1QkEsQ0FBQ0E7UUFDRCxvQkFBRyxHQUFILFVBQUssSUFBSSxFQUFFLEdBQUk7WUFBZkMsaUJBSUNBO1lBSEdBLEdBQUdBLEdBQUdBLENBQUNBLEdBQUdBLENBQUNBLENBQUFBO1lBQ1hBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBLEdBQUdBLENBQUNBLFVBQUFBLEdBQUdBLElBQUlBLE9BQUFBLEdBQUdBLEdBQUdBLEtBQUlBLENBQUNBLFdBQVdBLENBQUNBLEdBQUdBLEVBQUVBLEdBQUdBLENBQUNBLEVBQWhDQSxDQUFnQ0EsQ0FBQ0EsQ0FBQUE7WUFDNURBLE1BQU1BLENBQUNBLEdBQUdBLENBQUFBO1FBQ2RBLENBQUNBO1FBZUQsNEJBQVcsR0FBWCxVQUFhLEdBQUcsRUFBRSxHQUFJO1lBQXRCQyxpQkFnQkNBO1lBZkdBLElBQUlBLElBQUlBLEdBQUdBLEVBQUVBLENBQUFBO1lBQ2JBLEdBQUdBLENBQUNBLE9BQU9BLENBQUNBLFVBQUFBLENBQUNBO2dCQUVUQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxZQUFZQSxLQUFLQSxDQUFDQTtvQkFDbkJBLEVBQUVBLENBQUNBLENBQUNBLEdBQUdBLElBQUlBLEdBQUdBLENBQUNBO3dCQUNYQSxJQUFJQSxHQUFHQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFBQTtvQkFDekJBLElBQUlBO3dCQUNBQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFBQTtnQkFDekJBLElBQUlBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBLE9BQU9BLENBQUNBLElBQUlBLFFBQVFBLENBQUNBO29CQUMxQkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsR0FBR0EsSUFBSUEsR0FBR0EsQ0FBQ0E7d0JBQ1hBLElBQUlBLEdBQUdBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLEtBQUlBLENBQUNBLFVBQVVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUFBO29CQUMxQ0EsSUFBSUE7d0JBQ0FBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBLENBQUFBO1lBQzdCQSxDQUFDQSxDQUFDQSxDQUFBQTtZQUNGQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFBQTtRQUNmQSxDQUFDQTtRQUdELDJCQUFVLEdBQVYsVUFBWSxRQUFRO1lBQ2hCQyxNQUFNQSxDQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxVQUFTQSxHQUFHQTtnQkFDekMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQTtZQUN4QixDQUFDLENBQUNBLENBQUFBO1FBQ05BLENBQUNBO1FBQ0wsYUFBQztJQUFELENBQUMsQUFqSVEsR0FpSVIsQ0FBQSJ9