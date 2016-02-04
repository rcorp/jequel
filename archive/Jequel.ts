export = class Jequel {
    from = {}
    select = {}
    results = {}
    constructor (jsonObj){
        this.json = jsonObj
        this.results = this.json
    }

    Select (selectPath) {
        this.selectResults = this.bfs (selectPath, this.results)
        this.results = this.selectResults
        return this
    }

    MultiSelect (selectPaths) {
        selectPaths = selectPaths instanceof Array ? selectPaths: [selectPaths]
        this.selectResults = selectPaths.map(selectPath =>
            this.bfs (selectPath, this.results))
        this.results = this.selectResults
        return this
    }

    /**
     * Transforms an array of arrays sequentially, picking up the ith
     * element from each array and passing it to callback `cb`.
     *
     * @example
     *
     *
     *
     *
     * @param  {Function} cb [Callback function which will be invoked with a s
     * single array.]
     * @return {[type]}      [description]
     */
    SequentialTransformer (cb) {
        var results = this.results

        //Find the length of the maximum sized array within the array of arrays
        var l = Math.max.apply(null, results.map(r => r.length))

        //Iterate through each element of the sub array
        for (var i = 0; i < l; i ++){
            var args = []
            // Iterate through each of the sub arrays
            for (var j = 0; j < results.length; j++){
                args.push(results[j][i])
            }

            args = cb(args)
            //for (var j = 0; j < results.length; j++)
            //   results[j][i] = args[j]
        }
        return results
    }


    Where (whereConditions) {
        this.results = this.results.filter(result =>
            whereConditions.every(whereCondition =>
                this.bfs(whereCondition.path, result).some(val =>
                    JSON.stringify(val) == JSON.stringify(whereCondition.value)
                )
            )
        )
        return this
    }

    query ({select, from, where}) {
        this.select = select
        this.from = from
        this.where = where

        var selectResults = this.selected = this.bfs (this.select, this.from)
        if (this.where)
            return selectResults.filter(selectResult => {
                return this.where.every(where => {
                    return this.bfs(where.path, selectResult).some(val => {
                        return (JSON.stringify(val) == JSON.stringify(where.value))
                    })
                })
            })
        else
            return selectResults
    }
    bfs (path, obj?){
        obj = [obj]
        path.split('.').map(key => obj = this.bfsTraverse(key, obj))
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
    bfsTraverse (key, obj?) {
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
