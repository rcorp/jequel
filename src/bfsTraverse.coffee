

	# bfsTraverse
	#
	# It will traverse all nodes of object
	#
	# Arguments of functionToCall like that
	#
	# i.e...      objectToTraverse = [{a:[{b:1}]}]
	#   first time
	#    { value:[{a:[{b:1}]}]
	#       path:""
	#     }
	#
	#   second time
	#   {value:{a:[{b:1}]}
	#    path:0
	#     }
	#
	#    third time
	#    {value:[{b:1}]
	#      path:0/a
	#     }






	bfsTraverse = (objectToTraverse, functionToCall) ->
		q = [objectToTraverse]
		while q.length isnt 0

			# This is the parent node being popped out of the Queue.
			parentNode = {value: q.shift(), path:''}


			if typeof parentNode.value is 'object'
				for key,nodeValue of parentNode.value
					parentNode.path = if parentNode.path then parentNode.path + '/' + key else key
					parentNode.value = nodeValue
					functionToCall nodeValue, parentNode
					q.push nodeValue


	module.exports = bfsTraverse
