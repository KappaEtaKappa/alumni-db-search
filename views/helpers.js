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

	Handlebars.registerHelper('datepicker', function(name, d){
		var selected = "selected";
		if(!d)
			selected = "";
		
		var date = new Date(+d);
		
		var ret = "<select name='member-"+name+"-month'>";
		for(var i=0; i<m.length; i++)
			if(i == date.getMonth())
				ret+= '<option  value="'+ i +'" '+selected+'>'+ m[i] +'</option>';
			else
				ret+= '<option  value="'+ i +'">'+ m[i] +'</option>';
		ret+="</select>"

		var currentYear = new Date().getFullYear();
		ret += "<select name='member-"+name+"-year'>";
                for(var i=currentYear; i>1923; i--)
                        if(i == date.getFullYear())
                                ret+= '<option  value="'+ i +'" '+selected+'>'+ i +'</option>';
                        else
                                ret+= '<option  value="'+ i +'">'+ i +'</option>';
                ret+="</select>"		

		return ret;
	});

	Handlebars.registerHelper('greater', function(v1, v2, options) {
	  if(v1 > v2) {
	    return options.fn(this);
	  }
	  return options.inverse(this);
	});

	Handlebars.registerHelper('parse', function(v1, options) {
	    return options.fn(JSON.parse(v1));
	});
	Handlebars.registerHelper('exists', function(v1, options) {
	    if(v1)
	    	return true;
    	return false;
	});
}
