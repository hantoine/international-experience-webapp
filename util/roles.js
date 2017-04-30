exports.Roles = {
	NOBODY: 10,
	ADMIN: 2,
	STUDENT: 1,
	PUBLIC: 0
}

exports.getRole = function(session) {
	if(session.adminLogged) {
		return exports.Roles.ADMIN;	
	}
	if(session.studentid) {
		return exports.Roles.STUDENT;
	}
	return exports.Roles.PUBLIC;	
}
