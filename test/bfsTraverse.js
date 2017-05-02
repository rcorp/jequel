var chai = require('chai');
var expect = require('chai').expect;
var should = require('chai').should;
var bfsTraverse = require("../src/bfsTraverse");



describe("bfsTraverse()", function() {
	bfsTraverse([{
		a: [{
			b: 'c'
		}]
	}],function(node, parent){
		console.log('node', node, 'parent', parent)
	})
})
