# ## BFS Transformer
pointer = require('./pointer.coffee')

bfsTransform = (obj, transforms)->

	# Check if any transforms match the root node which has a path `''`.
	root = {value: obj, path: ''}
	for transformPath, transformFunction of transforms
		if pointer.isMatchingPath transformPath, ''
			root = transformFunction(root).node

	# Initialise a Queue Data Structure and hold the root Object
	q = [root]
	while q.length isnt 0

		# This is the parent node being popped out of the Queue.
		parentNode = q.shift()
		node = {}

		if typeof parentNode.value is 'object'
			for key, nodeValue of parentNode.value
				node.path = if parentNode.path then parentNode.path + '/' + key else key
				node.value = nodeValue

				# Now loop over all the transforms given to us in `transforms`. A more efficient solution
				# later would be to keep track of the level depth of the BFS and only execute those
				# transformations of the current level.
				#
				# Eg: `*/*/*` should not be transformed until at least BFS has gone 3 leves down.
				for transformPath, transformFunction of transforms
					if pointer.isMatchingPath transformPath, node.path
						newNodes = transformFunction node, {path: parentNode.path, value: parentNode.value}
						node = newNodes.node
				q.push {path: node.path, value: node.value}
	return obj
module.exports = bfsTransform
