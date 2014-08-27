# Popular Cache

An in-memory LRU cache with easy statistics and smart proxy mode.

# Installation

	npm install popular-cache --save

# Basic Usage

	var pcache = require('popular-cache');
		cache = pcache({
			maxSize: 500,
			maxAge: 1000 * 60 * 60	// in millisecond
		}),
		smallCache = pcache(50);	// or simply sets max size

	// basic usage
	cache.set("key", "value")
	cache.get("key")
	cache.del("key")	// delete key
	cache.size()		// get size
	cache.reset()   	// resets cache

	cache.hits()		// get total hits
	cache.misses()		// get total misses

	// print the most popular keys and the number of hits
	cache.popular(function(key, value, hits){
		console.log(key + ': ' + hits);
	}, 5);

	// print the most recently used keys and the number of hits
	cache.recent(function(key, value, hits){
		console.log(key + ': ' + hits);
	}, 10);

# Proxy Mode

Proxy mode is as simple as telling popular-cache what you want and then you just get and get. Cache misses and concurrent requests are handled automatically.

	// some time consuming process like HTTP request
	var httpRequest = function(key, callback){
		setTimeout(function(){
			if(key=='popular-cache') callback('I am popular-cache');
			else callback('others');
		}, 1000);
	}
	// use the proxied cache returned by proxy()
	var cache = pcache(50).proxy(httpRequest);
	 
	cache.get('popular-cache', function(value){
		console.log(value); // I am popular-cache
	});
	cache.get('another key', function(value){
		console.log(value); // others
	});

Note that the value is not returned directly in proxy mode. Instead, it's returned via callback.

# APIs

- **set(key, value)**

	- Stores a value. 
	- Updates the "recently used"-ness of the entry.
	- Resets the age of the entry.

- **get(key)** (Normal Mode)

	- Gets a value for a given key. Returns null if not found.
	- Updates the "recently used"-ness of the entry.
	- Increases the hits of the entry

- **del(key)**
	
	- Deletes an entry for a given key.

- **size()**
	
	- Gets the current number of entries in the cache.

- **reset()**
	
	- Deletes all entries in the cache.

- **hits()**
	
	- Gets the total hits.

- **misses()**
	
	- Gets the total misses.

- **recent(function(key, value, hits), [limit])**

	- Iterate over recent used entries in reverse chronological order.
	- `key`: the key of the entry.
	- `value`: the value of the entry.
	- `hits`: the number of hits of the entry.
	- `limit`: optional, the maximum number of iterations.

- **popular(function(key, value, hits), [limit])**

	- Iterate over most popular entries in descending order of hits.
	- `key`: the key of the entry.
	- `value`: the value of the entry.
	- `hits`: the number of hits of the entry.
	- `limit`: optional, the maximum number of iterations.

- **proxy(function(key, callback(value)))**

	- Build and return a proxied cache to enter proxy mode.
	- The proxy function `function(key, callback)` is usually a time consuming process to retrieve the latest value associated with `key`. It will be called automatically on cache misses.
	- The latest value should be returned to proxy via `callback(value)`.

- **get(key, function(value))** (only in proxy mode)

	- same as `get(key)` except how the value is returned. The callback `function(value)` is required in proxy mode to receive the value.

