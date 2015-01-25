var Dialog = function (type,title,options){
	this.type  = type;
	this.options = options;
	this.title = title;
	this.dialog = function(){
		var element = $("<div class='dialog'><p>" + this.title + "</p><div class='actions'></div></div>");

		switch(this.type){
			case "start":
				element.find(".actions" ).append("<button class='dialog-btn'>Start</button>");
				break;
			case "alert":
				var toAppend = (options) ? options : "Test";
				element.find(".actions").append("<button class='dialog-btn'>" + toAppend + "</button>");
				break;
			case "challengeSelect":
				options.forEach(function(el,i){
					var btn = $("<button class='dialog-btn'>" + el + "</button>");
					element.find(".actions").append(btn);
				});
				break;
			default:
		}

		element.find(".dialog-btn" ).click(this.close);
		return element;
	};

}

Dialog.prototype.show = function(){
	$("#dialog-holder").empty();
	$("#dialog-holder").append(this.dialog());
};

Dialog.prototype.selection = function(callback) {
	callback();
};

Dialog.prototype.close = function(){
	$("#dialog-holder").empty();
};