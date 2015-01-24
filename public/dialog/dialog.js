var dialog = function(type,title,options){
	this.type  = type;
	this.options = options;
	this.title = title;
	this.dialog = (function(){
		var element = $("<div class='dialog'><p>" + this.title + "</p><div class='actions'></div></div>");

		switch(this.type){
			case "start":

				break;
			case "alert":
				element.find(".actions").append("<p>" + options + "</p>");
				break;
			case "challengeSelect":
				options.forEach(function(el,i){
					var btn = $("<button class='dialog-btn'>" + el + "</button>");
					element.find(".actions").append(btn);
				});
				break;
			default:
		}

		return element;
	})();

};

dialog.prototype.show = function(){
	this.dialog.show();
};

dialog.prototype.selection = function(callback) {
	callback();
};

dialog.prototype.close = function(){

};