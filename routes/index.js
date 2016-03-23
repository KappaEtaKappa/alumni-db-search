var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	db.all( "SELECT CHAPTER, NUMBER, LAST, FIRST, COMPANY, INITIATED,"+
		"GRADUATION, FATHER, STATUS, STATE FROM alumni ORDER BY INITIATED DESC LIMIT 25;",
		function(err, top10){
			if(err) console.log(err, top10);
			res.render('index', { title: 'KHK Alumni Search', data: top10, last:top10[top10.length-1].NUMBER, error:err });		
		}
	);
});

router.get('/next', function(req, res, next) {
	db.all( "SELECT CHAPTER, NUMBER, LAST, FIRST, COMPANY, INITIATED,"+
		"GRADUATION, FATHER, STATUS, STATE FROM alumni WHERE NUMBER < "+req.query.lastn+" ORDER BY INITIATED DESC LIMIT 25;",
		function(err, next10){
			if(err) console.log(err, next10);
			res.render('partials/results', { data: next10, last:next10[next10.length-1].NUMBER });		
		}
	);
});


module.exports = router;
