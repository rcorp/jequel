var _util = {
    getValueBetweenSqBrackets: function (v) { return v.split('[')[1].split(']')[0] },
    hasSqBracket: function (v) {return ( (v.indexOf('[') != -1) &&  (v.indexOf(']') != -1) )},

    curry: function(func) {
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
}

export = class Jequel {
    _functions = []
    from = {}
    select = {}

    query ({select, from, where}) {
        this.select = select
        this.from = from
        this.where = where

        var selectResults = this.selected = this.bfs (this.select, this.from)
        if (this.where)
            return selectResults.filter(selectResult => {
                return this.where.every(where => {
                    return this.bfs(where.path, selectResult).some(val => {
                        console.log('val', val)
                        return (val == where.value)
                    })
                })
            })
        else
            return selectResults
    }
    bfs (path, obj?){
        obj = [obj]
        path.split('.').map(key => obj = this.traverse(key, obj))
        return obj
    }
    /**
     * Traverse obj via a key for one level
     * Breadth First Search.
     *
     * @param  {[type]} key
     * @param  {[type]} obj The object to perform the BFS in
     * @return {[type]} Literally means go `key` property down each value in
     * `obj` and return results (if any)!
     * @example
     * ```
     * traverse('*', {a : "b"}) => ["b"]
     * traverse('0', [1, 2, [{a: 3}], ['this', 'that'] ]) => [{a:3}, 'this' ]
     * ```
     */
    traverse (key, obj?) {
        var data = []
        obj.forEach(x => {

            if (x instanceof Array)
                if (key == '*')
                    data = data.concat(x)
                else
                    data.push(x[key])
            else if (typeof x == 'object')
                if (key == '*')
                    data = data.concat(this._getValues(x))
                else
                    data.push(x[key])
        })
        return data
    }

    //Similar to Underscore's _.values()
    _getValues (myObject){
        return Object.keys(myObject).map(function(key){
            return myObject[key]
        })
    }
}
