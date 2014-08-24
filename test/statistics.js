var assert = require('assert'),
	pcache = require('../lib/cache')
describe('statistics', function(){
	it('should be able to get total hits and misses', function(){
		var cache = pcache();
		for(var i=0; i<10; i++){
			cache.set(''+i, i);
		}
		for(var i=0; i<10; i++){
			cache.get('2');
		}
		for(var i=0; i<10; i++){
			cache.get('8');
		}
		for(var i=0; i<80; i++){
			cache.get('2');
		}
		for(var i=0; i<10; i++){
			cache.get('123');
		}
		assert.equal(100, cache.hits());
		assert.equal(10, cache.misses());
	})
	it('should be able to iterate recent items', function(){
		var cache = pcache({maxSize: 10});
		for(var i=0; i<10; i++){
			cache.set(''+i, i);
		}
		cache.get('2');
		cache.get('8');
		cache.get('6');
		cache.get('9');
		cache.get('8');
		// should get value in proper order
		var expected = [8, 9, 6, 2, 7, 5, 4, 3, 1, 0],
			expectedHit = [2, 1, 1, 1, 0, 0, 0, 0, 0, 0];
		var i = 0;
		cache.recent(function(key, value, hits){
			assert.equal(value, expected[i]);
			assert.equal(hits, expectedHit[i]);
			i++;
		});
		assert.equal(10, i);
	})
	it('should be able to iterate popular items', function(){
		var cache = pcache({maxSize: 10, maxAge: 100});
		for(var i=0; i<10; i++){
			cache.set(''+i, i);
		}
		for(var i=0; i<60; i++){
			cache.get('2');
		}
		for(var i=0; i<50; i++){
			cache.get('8');
		}
		for(var i=0; i<61; i++){
			cache.get('6');
		}
		for(var i=0; i<61; i++){
			cache.get('1');
		}
		// should get value in proper order
		var expected = [6, 1, 2, 8],
			expectedHit = [61, 61, 60, 50];
		var i = 0;
		cache.popular(function(key, value, hits){
			assert.equal(value, expected[i]);
			assert.equal(hits, expectedHit[i]);
			i++;
		}, 6);
		assert.equal(4, i);
	})
})
