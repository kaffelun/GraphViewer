$(".tab_thumb span").on("click", function(e) {
	var target = $(e.target);
	target.siblings(".selected").toggleClass("selected");
	target.parent().siblings(".tab_items").children(".selected").toggleClass("selected");
	target.toggleClass("selected");
	$("#"+target.html()).toggleClass("selected");
});
$("#button_apply").on("click", function() {
	env.render.SetResolution($("#n_width")[0].value|0, $("#n_height")[0].value|0)
});
$("#button_evaluate").on("click", function() {
	var mode = $("#FuncMode .selected").html();
	var x_min = env.EvalConst($(".selected .x_min")[0].value);
	var x_max = env.EvalConst($(".selected .x_max")[0].value);
	var y_min = env.EvalConst($(".selected .y_min")[0].value);
	var y_max = env.EvalConst($(".selected .y_max")[0].value);
	switch(mode) {
		case "Explicit":
			env.SetFunc($(".selected .formula")[0].value);
			env.render.SetRange(x_min, x_max, y_min, y_max);
			break;
		case "Parameter":
			var elem = $(".selected .formula");
			env.SetFunc(elem[0].value, elem[1].value);
			var t_min = env.EvalConst($(".selected .t_min")[0].value);
			var t_max = env.EvalConst($(".selected .t_max")[0].value);
			var density = $(".selected .density")[0].value;
			env.render.SetRange(x_min, x_max, y_min, y_max, t_max, t_min, density);
			break;
	}
	env.render.DrawGraph(mode);
	env.render.DrawAxis();
});