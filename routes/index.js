var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	db.all( "SELECT CHAPTER, NUMBER, LAST, FIRST, COMPANY, INITIATED,"+
		"GRADUATION, FATHER, STATUS, STATE FROM alumni ORDER BY INITIATED DESC, NUMBER DESC LIMIT 25;",
		function(err, top10){
			if(err) console.log(err, top10);
			res.render('index', { title: 'KHK Alumni Search', data: top10, last:top10[top10.length-1].NUMBER, error:err });		
		}
	);
});

router.get('/next', function(req, res, next) {
	db.all( "SELECT CHAPTER, NUMBER, LAST, FIRST, COMPANY, INITIATED,"+
		"GRADUATION, FATHER, STATUS, STATE FROM alumni WHERE NUMBER < "+req.query.lastn+" ORDER BY INITIATED DESC, NUMBER DESC LIMIT 25;",
		function(err, next10){
			if(err) console.log(err, next10);
			res.render('partials/results', {layout:false, data: next10, last:next10[next10.length-1].NUMBER });		
		}
	);
});

function searchif(name, input, firstTerm){
	if(name && input)
		if(firstTerm.hasOccurred){
			return " OR LOWER("+name+") LIKE LOWER('%"+input+"%')";
		}else{
			firstTerm.hasOccurred = true;
			return " LOWER("+name+") LIKE LOWER('%"+input+"%')";
		}
	return "";
}
router.get('/search', function(req, res, next) {
        var firstTerm = {hasOccurred:false};
	var sqlSearch = "SELECT CHAPTER, NUMBER, LAST, FIRST, COMPANY, INITIATED,"+
                " GRADUATION, FATHER, STATUS, STATE FROM alumni WHERE " +
		searchif("FIRST", req.query.FIRST, firstTerm) +
		searchif("LAST", req.query.LAST, firstTerm) +
		searchif("COMPANY", req.query.COMPANY, firstTerm) +
                searchif("FATHER", req.query.FATHER, firstTerm) +
                searchif("STATUS", req.query.STATUS, firstTerm) +
                searchif("STATE", req.query.STATE, firstTerm) +
                searchif("CHAPTER", req.query.CHAPTER, firstTerm) +
		searchif("INITIATED", new Date(req.query.INITIATED).getTime()/1000, firstTerm) +
		" ORDER BY INITIATED DESC, NUMBER DESC LIMIT 25;";
	console.log(sqlSearch);
        db.all(sqlSearch, function(err, searchResult){
                if(err) console.log(err);
        	res.render('partials/results', {layout:false, data: searchResult });
        });
});


router.get('/help', function(req, res, next) {
        var loggedIn = true
	var memberNo = parseInt(req.query.n);
	
	if(memberNo == null || isNaN(memberNo) || memberNo == undefined){
		res.render('error', {message:"User not found!", error:{status:400, stack:""}});
		return;
	}

	db.get( "SELECT * FROM alumni WHERE NUMBER="+memberNo+";", function(err, member){
        	if(err){ console.log(err, member); res.render('err', {message:"Member Not found", error:{status:404, stack:""}});}
		for(var key in member)
			member[key] = unescape(member[key]);
		res.render('help', { data:member });
        });
});

router.get('/member', function(req, res, next) {
	db.get( "SELECT * FROM alumni WHERE NUMBER = "+req.query.number+";",
		function(err, member){
			if(err) console.log(err, member);
			res.render('member', { data: member, NUMBER:member.NUMBER });		
		}
	);
});

module.exports = router;
