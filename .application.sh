#!/bin/bash
sqlite3 ../khk-ssa/khk-access/db.sqlite "INSERT INTO apps (name, privilegeRequired, subdomain, icon) values (\"Roster\", 1, \"roster\", \"fa-group\");"
sqlite3 ../khk-ssa/khk-access/db.sqlite "INSERT INTO apps (name, privilegeRequired, subdomain, icon) values (\"Roster Requests\", 2, \"roster-admin\", \"fa-user-plus\");"
sqlite3 ../khk-ssa/khk-access/db.sqlite "INSERT INTO apps (name, privilegeRequired, subdomain, icon) values (\"Roster Backups\", 2, \"roster-backup\", \"fa-database\");"
