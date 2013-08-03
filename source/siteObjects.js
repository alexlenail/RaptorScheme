function getCourses() {
	return $.getJSON("source/course_names.txt");
};

getCourses().done(function(){ depts = arguments;}, function(depts){
	drawSideBar(depts);
	console.log(depts);
});



function print(Department) {
	for(i = 0; i < Department.length; i++){

		for(j = 0; j < Department[i].length; j++){
			console.log(Department[i][j]);
		}
	}
}

function drawSideBar(Departments) {
	for(i = 0; i < Departments.length; i++) {
		if(Departments[i].length !== 0){
		var value = i;
			$("#Sidebar").append('<div class = "Department_button" id=' + i +'>' + Departments[i][0].dept + '</div>')
		}
	};
};















