var chai   = require('chai');
var expect = require('chai').expect;
var should = require('chai').should;

var treeMerge = require ("../src/tree-merge");
	console.log('a is')
		describe("treeMerge", function() {

			var a1 = [{name: 'n1', description: 'dx'}, {name: 'n2'}];
			var a2 = [{description: 'd1'}, {description: 'd2'}, {description: 'd2'}];
			var a  = treeMerge (a1,a2, '');
			it("Should Merge 2 tree", function () {

			expect(a).to.deep.equal([{"name":"n1","description":"d1"},{"name":"n2","description":"d2"},{"description":"d2"}])

			});

			it("Should Merge 2 array of objects", function ()
			{
			var a1 = [1,2];
			var a2 = [4,5];
      var a  = treeMerge(a1,a2, '');

			expect(a).to.deep.equal([1,2,4,5]);

			});

	 	  it("Should Merge 2 variable of objects", function ()
		  {
			  var a1 = 1;
				var a2 = 2;
				var a  = treeMerge(a1,a2, '');

				expect(a).to.deep.equal([1,2]);

			});

			it("Should Merge variable and array of objects", function ()
			{
			var a1 = 4;
			var a2 = ([1,2,3]);
			var a  = treeMerge(a1,a2, '');

			expect(a).to.deep.equal([4,1,2,3]);

			});

			it("Should Merge 2 string", function ()
		 {
		 var a1 = 'array';
		 var a2 = 'may be';
		 var a  = treeMerge(a1,a2, '');

		 expect(a).to.deep.equal(['array','maybe']);

		 });

			it("Should Merge tree and array of objects", function ()
			{
			var a1 = [1,2];
			var a2 = [{name: 'n1', description: 'dx'}, {name: 'n2'}];
      var a  = treeMerge(a1,a2, '');

			expect(a).to.deep.equal([1,2,{name: 'n1', description: 'dx'}, {name: 'n2'}]);

			});

			it("Should Merge tree and variable of objects", function ()
			{
			var a1 = 1;
			var a2 = [{name: 'n1', description: 'dx'}, {name: 'n2'}];
			var a  = treeMerge(a1,a2, '');

			expect(a).to.deep.equal([1,{name: 'n1', description: 'dx'}, {name: 'n2'}]);

			});

			it("Should Merge empty array", function ()
			{
			var a1 = [1,2]
			var a2 = [];
			var a  = treeMerge(a1,a2, '');

			expect(a).to.deep.equal([1,2]);

			});

			it("Should Merge array and string", function ()
			{
			var a1 = 'array';
			var a2 = []
			var a  = treeMerge(a1,a2, '');

			expect(a).to.deep.equal(['array']);

			});

			it("Should Merge variable and string", function ()
			{
			var a1 = 'array';
			var a2 = 1;
			var a  = treeMerge(a1,a2, '');

			expect(a).to.deep.equal(['array',1]);

			});


		})
