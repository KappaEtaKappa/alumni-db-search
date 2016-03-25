var m = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
var d = function(day){
	switch(day){
		case 1: return "1st"; break;
		case 2: return "2nd"; break;
		case 3: return "3rd"; break;
		case 21: return "21st"; break;
		case 22: return "22nd"; break;
		case 23: return "23rd"; break;
		case 31: return "31st"; break;
		default: return day+"st"; break;
	}
}
module.exports = function(Handlebars) {

	Handlebars.registerHelper('date', function(epoch, number) {
		if(epoch == null) 
				return "<a href='/help?n="+number+"'>&lt;unknown&gt;</a>";

		var date = new Date(epoch);
		return m[date.getMonth()] + ", " + date.getFullYear();
	});

	Handlebars.registerHelper('text', function(s, number) {
		if(s == null) return "<a href='/help?n="+number+"'>&lt;unknown&gt;</a>";
		return unescape(s);
	});
}