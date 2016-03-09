var chai = require('chai');
var expect = require('chai').expect;
var should = require('chai').should;

var treeMerge   = require ("../src/treeMerge");
describe("treeMerge", function(){
			var a1 =  [{name: 'n1', description: 'dx'}, {name: 'n2'}];
			var a2 = [{description: 'd1'}, {description: 'd2'}, {description: 'd2'}];
			var a = treeMerge (a1,a2, '');
			it("Merge 2 tree", function () {


        console.log('a is',a)
  			expect(a).to.deep.equal([{"name":"n1","description":"d1"},{"name":"n2","description":"d2"},{"description":"d2"}]);
  		});
});
