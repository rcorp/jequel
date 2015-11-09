(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    var _util = {
        getValueBetweenSqBrackets: function (v) { return v.split('[')[1].split(']')[0]; },
        hasSqBracket: function (v) { return ((v.indexOf('[') != -1) && (v.indexOf(']') != -1)); },
        curry: function (func) {
            var initial_args = [].slice.apply(arguments, [1]);
            var func_args_length = func.length;
            function curried(args) {
                if (args.length >= func_args_length) {
                    return func.apply(null, args);
                }
                return function () {
                    return curried(args.concat([].slice.apply(arguments)));
                };
            }
            return curried(initial_args);
        }
    };
    return (function () {
        function Jequel() {
            this._functions = [];
            this.from = {};
            this.select = {};
        }
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
                            console.log('val', val);
                            return (val == where.value);
                        });
                    });
                });
            else
                return selectResults;
        };
        Jequel.prototype.bfs = function (path, obj) {
            var _this = this;
            obj = [obj];
            path.split('.').map(function (key) { return obj = _this.traverse(key, obj); });
            return obj;
        };
        Jequel.prototype.traverse = function (key, obj) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSmVxdWVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiSmVxdWVsLnRzIl0sIm5hbWVzIjpbImN1cnJpZWQiLCJjb25zdHJ1Y3RvciIsInF1ZXJ5IiwiYmZzIiwidHJhdmVyc2UiLCJfZ2V0VmFsdWVzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7OztJQUFBLElBQUksS0FBSyxHQUFHO1FBQ1IseUJBQXlCLEVBQUUsVUFBVSxDQUFDLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBLENBQUMsQ0FBQztRQUNoRixZQUFZLEVBQUUsVUFBVSxDQUFDLElBQUcsTUFBTSxDQUFDLENBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUssQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUUsQ0FBQSxDQUFBLENBQUM7UUFFekYsS0FBSyxFQUFFLFVBQVMsSUFBSTtZQUNoQixJQUFJLFlBQVksR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2xELElBQUksZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztZQUVuQyxpQkFBaUIsSUFBSTtnQkFDakJBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLElBQUlBLGdCQUFnQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7b0JBQ2xDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxJQUFJQSxFQUFFQSxJQUFJQSxDQUFDQSxDQUFDQTtnQkFDbENBLENBQUNBO2dCQUVEQSxNQUFNQSxDQUFDQTtvQkFDSCxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxN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