var dialog = function(type,title,options){
	this.type  = type;
	this.options = options;
	this.title = title;
	this.create = function(){
		var element = $("<p>" + this.title + "</p>");

		switch(this.type){
			case "start":

				break;
			case "alert":
				element.append("<p>" + options + "</p>");
				break;
			case "challengeSelect":
				options.forEach(function(el,i){
					var btn = $("<button class='dialog-btn'>" + el + "</button>");
					element.prepend(btn);
				});
				break;
			default:
		}

		return element;
	};

};

dialog.prototype.show = function(){
	var dialog = this.create();
	dialog.show();
};

dialog.prototype.selection = function(callback) {
	callback();
};

dialog.prototype.close = function(){

};