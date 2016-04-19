# Returns a `map` object which places *paths to be changed* as keys and *changed paths* as values.
# Given `fromPath = '*/k3/k4/*/k5'` and `toPath = '*/*/*/c3/c4/*/c5'`
# this returns a `map` object
# ```
# 	maps = {
# 		'*/*/*/k3': '*/*/*/c3',
# 		'*/*/*/c3/k4': '*/*/*/c3/c4',
# 		'*/*/*/c3/c4/*/k5': '*/*/*/c3/c4/*/c5',
# 	}
# ```

bfsTransform = require './bfsTransform.coffee'
_ = require 'underscore'


createRenameMapping = (fromPath, toPath) ->
	toPath = toPath.split '/'
	fromPath = fromPath.split '/'
	offset = toPath.length - fromPath.length

	# `toPath` is usually > `fromPath`. Since the subtree will be joint, we will need to append the difference to
	# `fromPath`
	fromPath = toPath.slice(0, offset).concat(fromPath)

	# The variable used to hold the return value.
	map = {}
	for path, i in toPath
		if (toPath[i] isnt '*') and (toPath[i] isnt fromPath[i])
			map[fromPath.slice(0, i + 1).join('/')] = toPath.slice(0,i + 1).join('/')
			fromPath[i] = toPath[i]
		else
			continue
	return map

treeRename = (destObj, renameMaps) ->
	map = {}
	for sourcePath, destPath of renameMaps
		map = _.extend map, createRenameMapping sourcePath, destPath

	transforms = {}
	for fromPath, toPath of map
		transforms[fromPath] = ((toPath, fromPath) ->

			# slice() and pop() Get the last path pointer / key
			# http://stackoverflow.com/a/12099341
			toKey = toPath.split('/').pop()
			fromKey = fromPath.split('/').pop()

			return (node, parent) ->
				if parent.value[fromKey] isnt undefined
					parent.value[toKey] = parent.value[fromKey]
					console.log 'deleting', parent.value[fromKey]
					delete parent.value[fromKey]

				node.path = replaceLastString(node.path, '/' + fromKey, '/' + toKey)

				return {
					node: node
					parent: parent
				})(toPath, fromPath)

		bfsTransform destObj, transforms

module.exports = treeRename
