# ## JSON Pointer Operations

pointer = {}

# Used to insert a specific value (`val`) at a specific path (`path`) in a given JSON Object (`obj`)
pointer.setValue = (obj, path, val) ->
	destPath = 'obj'
	for p in path.split '/'

		# In case path doesnt have a `/`
		destPath += "['#{p}']" if p isnt ""
	eval destPath + '=val'
	return obj

# Used to return the value at a specific path (`path`) in a given JSON Object (`obj`)
pointer.getValue = (obj, path) ->
	destPath = 'obj'
	for p in path.split '/'

		# In case path doesnt have a `/`
		destPath += "['#{p}']" if p isnt ""

	# Woops! We have to remove eval in this!
	return eval destPath

# Used to match 2 dynamic JSON Pointers
pointer.isMatchingPath = (path1, path2) ->
	path1 = path1.split '/'
	path2 = path2.split '/'
	if path2.length > path1.length
		[path2, path1] = [path1, path2]
	path1.every (el, index) ->
		((path2[index] is '*') or (path2[index] is el) or (el is '*')) and ((el isnt undefined) and (path2[index] isnt undefined))

# Javascript's native `replace` replaces only first instances of substrings.
# Replace the last instance of `substr` in `str` with `newSubstr`.
replaceLastString = (str, what, replacement) ->
    pcs = str.split(what);
    lastPc = pcs.pop();
    return pcs.join(what) + replacement + lastPc;

module.exports = pointer
