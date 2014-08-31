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
		for(var i=0; i<70; i++){
			cache.get('2');
		}
		for(var i=0; i<10; i++){
			cache.get('123');
		}
		assert.equal(90, cache.hits());
		assert.equal(10, cache.misses());
		assert.equal(0.9, cache.hitRate());
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
			expectedHits = [2, 1, 1, 1, 0, 0, 0, 0, 0, 0];
		var i = 0;
		cache.recent(function(key, value, hits){
			assert.equal(expected[i], value);
			assert.equal(expectedHits[i], hits);
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
			expectedHits = [61, 61, 60, 50];
		var i = 0;
		cache.popular(function(key, value, hits){
			assert.equal(expected[i], value);
			assert.equal(expectedHits[i], hits);
			i++;
		}, 6);
		assert.equal(4, i);
	})
	it('should not count out-dated visits as a hit', function(done){
		var cache = pcache({maxSize: 10, maxAge: 10});
		cache.set('1', 1);
		cache.get('1');
		assert.equal(1, cache.hits());
		setTimeout(function(){
			// this is not a hit
			cache.get('1');
			cache.get('1');
			assert.equal(1, cache.size());
			assert.equal(1, cache.hits());
			// out-dated item is not removed on get
			cache.set('1', 2);
			cache.get('1');
			assert.equal(1, cache.size());
			assert.equal(2, cache.hits());
			done();
		}, 20);
	})
	it('should be able to get memory size', function(){
		var cache = pcache({maxSize: 10, maxAge: 10});
		for(var i=0; i<10; i++){
			cache.set(''+i, i);
		}
		assert.equal(1020, cache.memory());
	})
})
