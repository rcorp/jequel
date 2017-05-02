	var chai = require('chai');
	var expect = require('chai').expect;
	var should = require('chai').should;
	var jequel = require("../src/select");



	describe("select", function() {
		var obj = [{
			a: [{
				b: 'c'
			}]
		}];
	it("Should return a value", function() {

	expect(jequel.query(obj,{select:"0/a/0"})).to.deep.equal(
			 {b:'c'}
		)
	  });

	})
