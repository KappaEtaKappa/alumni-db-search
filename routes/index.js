var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	db.all( "SELECT CHAPTER, NUMBER, LAST, FIRST, COMPANY, TITLE, INITIATED,"+
		"GRADUATION, FATHER, STATUS FROM alumni ORDER BY INITIATED DESC LIMIT 10;",
		function(err, data){
			if(err){console.log(err, top10)};
			res.render('index', { title: 'KHK Alumni Search', data: top10, error:err });		
		}
	);
});

module.exports = router;
