console.log("I really dont think you are trying to run this script");
console.log("and if you really are, that's unfortunate.")
console.log("This will wipe and reset the production(repo'd)");
console.log("DB to the original build off of JPep's Excell sheet");
process.exit(1);

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
		return null
	return "'" + escape(s) + "'";
}
function orNaN(i){
	if(isNaN(i))
		return null;
	return i;
}

db.serialize(function() {
	if(exists)
		db.run("DROP TABLE alumni;");

      db.run("CREATE TABLE alumni (ID INTEGER);");
	db.run("CREATE TABLE changes (ID INTEGER, BEFORE BLOB, AFTER BLOB, SQL BLOB);");
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
		}, 30);
		var doneCount = 1;
		db.serialize(function(){	
			for(var i=1; i<data.length; i++){
                        if(false){
                              console.log("Entry: " + i);
                              console.log("ID: ", orNaN(parseInt(data[i][0])) );
                              console.log("ACCOUNT: ", orNaN(parseInt(data[i][1])) );
                              console.log("CHAPTER: ", orNull(data[i][2]) );
                              console.log("NUMBER: ", orNaN(parseInt(data[i][3])) );
                              console.log("SUFFIX: ", orNull(data[i][4]) );
                              console.log("LAST: ", orNull(data[i][5]) );
                              console.log("FIRST: ", orNull(data[i][6]) );
                              console.log("MIDDLE_INITIAL: ", orNull(data[i][7]) );
                              console.log("ADDRESS: ", orNull(data[i][8]) );
                              console.log("CITY: ", orNull(data[i][9]) );
                              console.log("STATE: ", orNull(data[i][10]) );
                              console.log("ZIP: ", orNull(data[i][11]) );
                              console.log("HOME: ", orNull(data[i][12]) );
                              console.log("COMPANY: ", orNull(data[i][13]) );
                              console.log("TITLE: ", orNull(data[i][14]) );
                              console.log("PHONE: ", orNull(data[i][15]) );
                              console.log("EMAIL: ", orNull(data[i][16]) );
                              console.log("SPOUSE: ", orNull(data[i][17]) );
                              console.log("UPDATED: ", orNaN(new Date(data[i][18]).getTime()) );
                              console.log("INITIATED: ", orNaN(new Date(data[i][19]).getTime()) );
                              console.log("GRADUATION: ", orNaN(new Date(data[i][20]).getTime()) );
                              console.log("FATHER: ", orNull(data[i][21]) );
                              console.log("STATUS: ", orNull(data[i][22]) );
                              console.log("MIDDLE_NAME: ", orNull(data[i][23]) );
                              console.log("EMAIL_UPDATED: ", orNaN(new Date(data[i][25]).getTime()) );
                        }
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
                                                orNull(data[i][2]) + "," +
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
						clearInterval(spinnerInv);
						console.log("Done!");
						console.log(doneCount + " entries inserted");
					}
				});	
			}
		});
	});
});
