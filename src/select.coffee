

	_ = require 'underscore'
	jequel={}

	jequel.query = (obj,path) ->

		destPath = 'obj'
		path = _.values(path)
		for i in path[0].split '/'
			destPath += "['#{i}']" if i isnt " "

		return eval destPath

	module.exports = jequel
