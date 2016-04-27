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
			res.render('partials/results', { data: next10, last:next10[next10.length-1].NUMBER });		
		}
	);
});


router.get('/help', function(req, res, next) {
        var loggedIn = true
	var memberNo = parseInt(req.query.n);
	
	console.log(memberNo);
	if(memberNo == null || isNaN(memberNo) || memberNo == undefined){
		res.render('error', {message:"User not found!", error:{status:400, stack:""}});
		return;
	}

	db.all( "SELECT * FROM alumni WHERE NUMBER="+memberNo+";", function(err, member){
        	if(err){ console.log(err, member); res.render('err', {message:"Member Not found", error:{status:404, stack:""}});}
		res.render('help', { 'member':member });
        });
});

router.get('/member', function(req, res, next) {
	console.log("holla")
	db.get( "SELECT * FROM alumni WHERE NUMBER = "+req.query.number+";",
		function(err, member){
			if(err) console.log(err, member);
			res.render('member', { data: member, NUMBER:member.NUMBER });		
		}
	);
});

module.exports = router;
