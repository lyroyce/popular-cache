# Popular Cache

An in-memory LRU cache with built-in statistics.

# Usage

	var pcache = require('popular-cache');
		cache = pcache({
			maxSize: 500,			// sets size limit
			maxAge: 1000 * 60 * 60	// sets age limit in millisecond
		}),
		smallCache = pcache(50);	// or simply sets size limit

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

# APIs

- **set(key, value)**

	- Stores a value. 
	- Updates the "recently used"-ness of the entry.
	- Resets the age of the entry.

- **get(key)**

	- Gets a value for a given key. Returns null if not found.
	- Updates the "recently used"-ness of the entry.
	- Increases the hits of the entry.

- **del(key)**
	
	- Deletes an entry for a given key.

- **size()**
	
	- Gets the current number of entries in the cache.

- **reset()**
	
	- Deletes all entries in the cache.

- **hits()**
	
	- Gets the total hits of the cache.

- **misses()**
	
	- Gets the total misses of the cache.

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