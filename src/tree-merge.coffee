# ## Recursive merge of 2 trees
#
# ```js
# var a1 = [{name: 'n1', description: 'dx'}, {name: 'n2'}];
# var a2 = [{description: 'd1'}, {description: 'd2'}, {description: 'd2'}];
#
# treeMerge (a1, a2)
# // a1 is now
# [{"name":"n1","description":"d1"},{"name":"n2","description":"d2"},{"description":"d2"}]
#
# ```
#
# This does not take variable paths in `destPath`. Eg instead of `'*/k'` you have to give `'1/k'`

pointer = require './pointer'

treeMerge = (destNode, sourceNode, destPath) ->
	merge = (dNode, sNode) ->
		# This when `destPath` points to an unknown location!
		if dNode is undefined
			testKey = Object.keys(sNode)[0]

			# if key is either a NUmber or a NUmber in a string.
			# Eg: `12` or `"22"` or `'0'` etc.
			if isNaN parseInt testKey isnt false
				dNode = []

			else
				dNode = {}

		for key of sNode
			if (dNode[key] isnt undefined) and (typeof dNode[key] is 'object')
				dNode[key] = merge(dNode[key], sNode[key])
			else
				dNode[key] = sNode[key]
		return dNode

	node = pointer.getValue destNode, destPath
	node = merge node, sourceNode
	pointer.setValue destNode, destPath, node

module.exports = treeMerge
