$(".tab_thumb span").on("click", function(e) {
	$(".selected").toggleClass("selected");
	$("#" + e.target.innerHTML).toggleClass("selected");
});
$("#button_apply").on("click", function() {
	env.render.SetResolution($("#n_width")[0].value|0, $("#n_height")[0].value|0)
});
$("#button_evaluate").on("click", function() {
	env.SetFunc($("#formula")[0].value);
	var x_min = env.EvalConst($("#x_min")[0].value);
	var x_max = env.EvalConst($("#x_max")[0].value);
	var y_min = env.EvalConst($("#y_min")[0].value);
	var y_max = env.EvalConst($("#y_max")[0].value);
	env.render.SetRange(x_min, x_max, y_min, y_max);
	env.render.DrawGraph();
	env.render.DrawAxis();
});