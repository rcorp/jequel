var chai = require('chai');
var expect = require('chai').expect;
var should = require('chai').should;


var treeRename = require ("../src/treeRename");
	describe("treeRename", function() {

     var a1 = '*/k3/k4/*/k5';
 	 	 var a2 = '*/c3/c4/*/c5';

		 var a = treeRename(a1,a2);

		 it("Should rename a tree", function () {

		 expect(a).to.deep.equal[{'*/k3' : '*/c3','*/c3/k4' : '*/c3/c4','*/c3/c4/*/k5' : '*/c3/c4/*/c5'}]

		 });

		 var a1 = 'array';
 		 var a2 = 'maybe';

 		 var a = treeRename(a1,a2);

 		 it("Should rename a string", function () {

 		 expect(a).to.deep.equal[{'a' : 'm','r' : 'a','r' : 'y','a' : 'b',}]

 		});

		var a1 = [1,2,3];
		var a2 = [4,5,6];

		var a = treeRename(a1,a2);

		it("Should rename a array", function () {

		expect(a).to.deep.equal[{'1':'4', '2':'5', '3':'6'}]

	 });

	 var a1 = 'array';
	 var a2 = [1,2,3,4,5];

	 var a = treeRename(a1,a2);

	 it("Should rename a string", function () {

	 expect(a).to.deep.equal[{'a' : '1','r' : '2','r' : '3','a' : '4', 'y':'5'}]

	});




})
