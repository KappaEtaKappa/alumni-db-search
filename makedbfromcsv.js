var sqlite3 = require('sqlite3').verbose();
var csv_parse = require('csv-parse');

var fs = require("fs");
var file = "alumni.sqlite";
var exists = fs.existsSync(file);

var db = new sqlite3.Database(file);

var spin = require('term-spinner');
var spinner = spin.new("◐◓◑◒");
function orNull(s){
	if(s.length == 0)
		return "NULL"
	return "'" + escape(s) + "'";
}
function orNaN(i){
	if(isNaN(i))
		return "NULL";
	return i;
}

db.serialize(function() {
	if(exists)
		db.run("DROP TABLE alumni;");

	db.run("CREATE TABLE alumni (ID INTEGER );");
});

fs.readFile("data.csv", "utf8", function(err, data){
	if(err){ console.log(err); process.exit(1);}
	
	csv_parse(data, function(err, data){
		if(err){ console.log(err); process.exit(1);}
		
		console.log(data[0]);
		db.serialize(function(){
			for(var i=1; i<data[0].length; i++){
				var columnNtype = data[0][i].split("/");
				db.run("ALTER TABLE alumni ADD COLUMN " + columnNtype[0] + " " + columnNtype[1] + ";", function(err){
					if(err){ console.log(err); process.exit(1);}
				});
			}
		});
		var spinnerInv = setInterval(function () {
			spinner.next();
			process.stdout.clearLine();
			process.stdout.cursorTo(0);
			process.stdout.write([spinner.current, "Processing..."].join(" "));
		}, 1000);
		var doneCount = 1;
		db.serialize(function(){	
			for(var i=1; i<data.length; i++){
                                var insert =    "INSERT INTO alumni (" +
                                                "ID, " +
                                                "ACCOUNT, " +
                                                "CHAPTER, " +
                                                "NUMBER, " +
                                                "SUFFIX, " +
                                                "LAST, " +
                                                "FIRST, " +
                                                "MIDDLE_INITIAL, " +
                                                "ADDRESS, " +
                                                "CITY, " +
                                                "STATE, " +
                                                "ZIP, " +
                                                "HOME, " +
                                                "COMPANY, " +
                                                "TITLE, " +
                                                "PHONE, " +
                                                "EMAIL, " +
                                                "SPOUSE, " +
                                                "UPDATED, " +
                                                "INITIATED, " +
                                                "GRADUATION, " +
                                                "FATHER, " +
                                                "STATUS, " +
                                                "MIDDLE_NAME, " +
                                                "EMAIL_UPDATED " +
                                              ") VALUES (" +
                                                orNaN(parseInt(data[i][0])) + "," +
                                                orNaN(parseInt(data[i][1])) + "," +
                                                orNaN(parseInt(data[i][2])) + "," +
                                                orNaN(parseInt(data[i][3])) + "," +
                                                orNull(data[i][4]) + "," +
                                                orNull(data[i][5]) + "," +
                                                orNull(data[i][6]) + "," +
                                                orNull(data[i][7]) + "," +
                                                orNull(data[i][8]) + "," +
                                                orNull(data[i][9]) + "," +
                                                orNull(data[i][10]) + "," +
                                                orNull(data[i][11]) + "," +
                                                orNull(data[i][12]) + "," +
                                                orNull(data[i][13]) + "," +
                                                orNull(data[i][14]) + "," +
                                                orNull(data[i][15]) + "," +
                                                orNull(data[i][16]) + "," +
                                                orNull(data[i][17]) + "," +
                                                orNaN(new Date(data[i][18]).getTime()) + "," +
                                                orNaN(new Date(data[i][19]).getTime()) + "," +
                                                orNaN(new Date(data[i][20]).getTime()) + "," +
                                                orNull(data[i][21]) + "," +
                                                orNull(data[i][22]) + "," +
                                                orNull(data[i][23]) + "," +
                                                orNaN(new Date(data[i][25]).getTime()) +
                                              ");";
				db.run(insert, function(err){
					if(err){ console.log(insert, err); process.exit(1);}
					doneCount++;
					if(doneCount == data.length){
						clearInterval(spinner);
						console.log("Done!");
					}
				});	
			}
		});
	});
});
