function Item(key, value) {
	this._key = key;
	this._value = value;
	this._hits = 0;
	this._updated = Date.now();
}
Item.prototype.key = function(){
	return this._key;
}
Item.prototype.value = function(value){
	if(value==undefined){
		return this._value;
	}else{
		this._value = value;
		this._updated = Date.now();
		return this;
	}
}
Item.prototype.hit = function(doHit){
	if(doHit) return ++this._hits;
	else 	  return this._hits;
}
Item.prototype.age = function(){
	return Date.now() - this._updated;
}

module.exports = Item;