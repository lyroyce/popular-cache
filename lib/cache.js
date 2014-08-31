var Item = require('./item'),
	Proxy = require('./proxy');

var popular = function(options){
	if (!(this instanceof popular))
    	return new popular(options)
    if (typeof options === 'number')
    	options = { maxSize: options }
    if(!options) options = {};

	this._maxAge = Number(options.maxAge);
	this._maxSize = Number(options.maxSize);
	this.reset();
}
popular.prototype.reset = function(){
	this._cache = {};
	this._hitList = [];
	this._topHitList = [];
	this._hits = 0;
	this._misses = 0;
}
popular.prototype.size = function() {
	return this._hitList.length;
}
popular.prototype.hits = function() {
	return this._hits;
}
popular.prototype.misses = function() {
	return this._misses;
}
popular.prototype.hitRate = function() {
	var total = this._hits + this._misses;
	return total ? this._hits / total : 0;
}
popular.prototype.set = function(key, value) {
	// null value can't be cached
	if(value == null) return false;

	if(this._cache.hasOwnProperty(key)){
		track(this, this._cache[key].value(value));
	}else{
		this.ensureSize();
		this._cache[key] = track(this, new Item(key, value));
	}
	return true;
}
popular.prototype.get = function(key) {
	if(!this._cache.hasOwnProperty(key)){
		this._misses++;
		return null;
	}

	var item = this._cache[key];
	// visiting out-dated item is not a hit
	// out-dated item is kept for future cache update.
	if(this.maxAgeEnabled() && item.age() > this._maxAge) return null;
	this._hits++;
	item = track(this, item, true);
	return item.value();
}
popular.prototype.del = function(key) {
	if(!this._cache.hasOwnProperty(key)) return false;

	if((pos = this._hitList.indexOf(key)) >= 0)
		this._hitList.splice(pos, 1);
	if((pos = this._topHitList.indexOf(key)) >= 0)
		this._topHitList.splice(pos, 1);
	delete this._cache[key];
	return true;
}
popular.prototype.clean = function() {
	if(this.maxAgeEnabled()){
		while(this._hitList.length > 0
			&& this._cache[this._hitList[0]].age() > this._maxAge){
			this.del(this._hitList.shift());
		}
	}
}
popular.prototype.ensureSize = function() {
	if(this._hitList.length >= this._maxSize){
		this.clean();
	}
	while(this._hitList.length >= this._maxSize){
		this.del(this._hitList.shift());;
	}
}
popular.prototype.maxAgeEnabled = function() {
	return this._maxAge >= 0;
}
popular.prototype.proxy = function(proxyFunc) {
	return new Proxy(this, proxyFunc);
}
popular.prototype.recent = function(callback, limit) {
	forEach(this, this._hitList, limit, callback);
}
popular.prototype.popular = function(callback, limit) {
	forEach(this, this._topHitList, limit, callback);
}

function forEach(self, list, limit, callback){
	if(!limit) limit = list.length;
	else limit = Math.min(limit, list.length);
	
	for(var i=1; i<=limit; i++){
		var key = list[list.length-i],
			item = self._cache[key];
		callback(key, item.value(), item.hit());
	}
}

function track(self, item, trackHit) {
	trackAccess(self, item);
	if(trackHit) trackHits(self, item);
	return item;
}
function trackAccess(self, item) {
	var pos = self._hitList.indexOf(item.key());
	if(pos < 0){
		self._hitList.push(item.key());
	}else{
		var records = self._hitList.splice(pos, 1);
		self._hitList.push(records[0]);
	}
}
function trackHits(self, item) {
	var hits = item.hit(true);
	var pos = self._topHitList.indexOf(item.key());
	if(pos < 0){
		self._topHitList.unshift(item.key());
	}else{
		while(pos+1<self._topHitList.length 
			&& self._cache[self._topHitList[pos+1]].hit()<hits){
			self._topHitList[pos] = self._topHitList[pos+1];
			pos++;
		}
		self._topHitList[pos] = item.key();
	}
}

module.exports = popular;