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
	var prefix = ".selected > div > "
	var mode = $("#FuncMode .selected").html();
	var x_min = env.EvalConst($(prefix + ".x_min")[0].value);
	var x_max = env.EvalConst($(prefix + ".x_max")[0].value);
	var y_min = env.EvalConst($(prefix + ".y_min")[0].value);
	var y_max = env.EvalConst($(prefix + ".y_max")[0].value);
	switch(mode) {
		case "Explicit":
			env.parser.ChangeVariable("x");
			env.SetFunc(mode, $(".formula")[0].value);
			env.render.SetRange(x_min, x_max, y_min, y_max);
			break;
		case "Parameter":
			var elem = $(prefix + ".formula");
			env.parser.ChangeVariable("t");
			env.SetFunc(mode, [elem[0].value, elem[1].value]);
			var t_min = env.EvalConst($(prefix + ".t_min")[0].value);
			var t_max = env.EvalConst($(prefix + ".t_max")[0].value);
			var density = $(prefix + ".t_density")[0].value;
			env.render.SetRange(x_min, x_max, y_min, y_max, t_max, t_min, density);
			break;
	}
	env.render.DrawGraph(mode);
	env.render.DrawAxis();
});