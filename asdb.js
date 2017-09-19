var fs = require("fs");

var sqlite3 = require("sqlite3").verbose();
var file = __dirname + "/alumni.sqlite";
if (!fs.existsSync(file)) {
	console.log("DB has not been built. Please run 'node makedbfromcsv.js'");
	process.exit(1)
}
global.db = new sqlite3.Database(file);
global.hbs = require('hbs');

var express = require('express');
var sqlinjection = require('sql-injection');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var roster = express();

global.ssa = {};
try {
  global.ssa = require("../khk-ssa/khk-access/index.js")();
} catch(e) {
  console.log("Failed to contact khk-ssa, please clone it from the repo adjacent to this folder.");
}

// view engine setup
roster.set('views', path.join(__dirname, 'views'));
roster.set('view engine', 'hbs');

global.hbs.registerPartials(__dirname + '/views/partials');
var helpers = require('./views/helpers')(global.hbs);


// uncomment after placing your favicon in /public
//roster.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
// roster.use(sqlinjection);
roster.use(logger('dev'));
roster.use(bodyParser.json());
roster.use(bodyParser.urlencoded({ extended: false }));
roster.use(cookieParser());
roster.use(express.static(path.join(__dirname, 'public')));

roster.use(ssa.navbar("Roster"));

/* GET home page. */
roster.get('/', function(req, res, next) {
  db.all( "SELECT CHAPTER, NUMBER, LAST, FIRST, COMPANY, INITIATED,"+
    "GRADUATION, FATHER, STATUS, STATE FROM alumni ORDER BY INITIATED DESC, NUMBER DESC LIMIT 25;",
    function(err, top10){
      if(err) console.log(err, top10);
      else{
        res.render('index', { title: 'KHK Alumni Search', data: top10, last:top10[top10.length-1].NUMBER, error:err});    
      }
    }
  );
});

//gets the next 25
roster.get('/next', function(req, res, next) {
  db.all( "SELECT CHAPTER, NUMBER, LAST, FIRST, COMPANY, INITIATED,"+
    "GRADUATION, FATHER, STATUS, STATE FROM alumni WHERE NUMBER < ? ORDER BY INITIATED DESC, NUMBER DESC LIMIT 25;",
    req.query.lastn,
    function(err, next10){
      if(err) console.log(err, next10);
      res.render('partials/results', {layout:false, data: next10, last:next10[next10.length-1].NUMBER});    
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
roster.get('/search', function(req, res, next) {
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
    db.all(sqlSearch, function(err, searchResult){
        if(err) console.log(err);
      res.render('partials/results', {layout:false, data: searchResult});
    });
});


roster.get('/help', function(req, res, next) {
  var memberNo = parseInt(req.query.n);
  
  if(memberNo == null || isNaN(memberNo) || memberNo == undefined){
    res.render('error', {message:"User not found!", error:{status:400, stack:""}});
    return;
  }

  db.get( "SELECT * FROM alumni WHERE NUMBER = ?;", memberNo, function(err, member){
    if(err){ console.log(err, member); res.render('err', {message:"Member Not found", error:{status:404, stack:""}});}
    for(var key in member)
      member[key] = unescape(member[key]);
    res.render('help', { data:member });
    });
});

roster.post('/help_submission', function(req, res){
  console.log(req.body);
  var user_id = req.body.member_id;
  var after = {};
  if(req.body.gradDateChanged == 'true')
    after.GRADUATION = new Date(req.body["member-graduated-year"], req.body["member-graduated-month"], 1,0,0,0,0).getTime();
  else
    after.GRADUATION = null;
  if(req.body.initDateChanged == 'true')
    after.INITIATED = new Date(req.body["member-initiated-year"], req.body["member-initiated-month"], 1,0,0,0,0).getTime();
  else
    after.INITIATED = null;
  delete req.body["member-graduated-year"];
  delete req.body["member-graduated-month"];
  delete req.body.gradDateChanged;
  delete req.body["member-initiated-month"];
  delete req.body["member-initiated-year"];
  delete req.body.initDateChanged;
  delete req.body.member_id;
  
  for(var key in req.body){
    var _key = key.split("-")[1];
    after[_key] = req.body[key];
  }

  var sql = "UPDATE alumni SET ";
  for(var key in after){
    if(isNaN(after[key]))
      if(after[key] == "")
        sql += key +"=null, ";
      else
        sql += key +"='"+escape(after[key])+"', "
    else
      sql += key +"="+after[key]+", "
  }
  sql += "NUMBER="+user_id +" WHERE NUMBER="+user_id;
  db.run("DELETE FROM changes WHERE ID=?;", user_id, function(err){
    if(err) console.log(err);
    db.get( "SELECT * FROM alumni WHERE NUMBER = ?;", user_id, function(err, before){
      if(err || !before){ console.log(err, member); res.render('err', {message:"Member Not found", error:{status:404, stack:""}});}
      db.run("INSERT INTO changes (ID, BEFORE, AFTER, SQL) values (?, ?, ?, ?);",
             user_id, JSON.stringify(before), JSON.stringify(after), sql, function(err){
        if(err) res.redirect("/help?n="+user_id);
        else
          res.redirect("/submissions");
      });
    });
  });
});

roster.get('/submissions', function(req, res){
  ssa.getPriviledgeLevel(req.cookies.token, function(err, privLevel){
    if(err || isNaN(privLevel) || privLevel < 2) res.render("thank");
    else
      db.all("SELECT * FROM changes", function(err, changes){
        if(err) res.render("check_submissions", {changes:[]});
        else res.render("check_submissions", {changes:changes});
      });
  });
});

roster.post('/accept_submission', function(req, res){
  ssa.getPriviledgeLevel(req.cookies.token, function(err, privLevel){
    if(err || isNaN(privLevel) || privLevel < 2) res.render("thank");
    else
      db.get("SELECT SQL FROM changes WHERE ID=?", req.body.NUMBER, function(err, change){
        if(err || !change) res.redirect("/submissions");
        else{
          db.run(change.SQL);
          db.run("DELETE FROM changes WHERE id=?", req.body.NUMBER);
          res.redirect("/submissions");
        }
      });
  });
});

roster.post('/reject_submission', function(req, res){
  ssa.getPriviledgeLevel(req.cookies.token, function(err, privLevel){
    if(err || isNaN(privLevel) || privLevel < 2) res.render("thank");
    else
      db.run("DELETE FROM changes WHERE ID=?", req.body.NUMBER, function(err, change){
        res.redirect("/submissions");
      });
  });
});

roster.get('/member', function(req, res, next) {
  db.get( "SELECT * FROM alumni WHERE NUMBER = ?;", req.query.number,
    function(err, member){
      if(err) console.log(err, member);
      res.render('member', { data: member, NUMBER:member.NUMBER });   
    }
  );
});

roster.get('/backup', function(req, res){
  res.download(__dirname + '/alumni.sqlite', (new Date()).toISOString()+'.sqlite');
});

// catch 404 and forward to error handler
roster.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});


// production error handler
// no stacktraces leaked to user
roster.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = roster;

roster.listen(7000);
