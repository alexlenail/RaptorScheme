function change_background_to_open_button() {
$("#button").css('background-image','url(images/graphics/open_button.png)');}

function change_background_to_close_button() {
$("#button").css('background-image','url(images/graphics/close_button.png)');}

function change_background_to_close_button_set() {
	$("#button").promise().done(function() {
		change_background_to_close_button();});}


$(document).ready(function(){
	$(".Department_button").hide();
	$("#Department_Title").hide();

	$("#button").toggle(function Open(){
		$("#button").delay(400).animate({right: "200px"}, 400);
		$("#Sidebar").animate({width: "254px"}, 400);
		change_background_to_close_button_set();
		$(".Department_button").delay(800).fadeIn(300);
		$("#Department_Title").delay(1000).fadeIn(200);
	},function Close(){
		$(".Department_button").hide();
		$("#Department_Title").fadeOut(200);
		$("#button").animate({right: "0px"}, 400);
		$("#Sidebar").animate({width: "0px"}, 400);	
		change_background_to_open_button();
	}); 		
	
});

