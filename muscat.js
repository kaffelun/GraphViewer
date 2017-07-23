
function System() {
}

System.prototype = {
	Init: function() {
		this.render = new Render();
		this.render.Init($("#main_canvas")[0]);
		this.parser = new Parser();
		this.const_parser = new Parser("const");
	},
	SetFunc: function(mode, f) {
		// this is managed code.
		if(mode == "Explicit") {
			this.func = [new Function("x", "return " + this.parser.Evaluate(f))];
		} else if (mode == "Parameter") {
			this.func = [new Function("t", "return " + this.parser.Evaluate(f[0])),
			             new Function("t", "return " + this.parser.Evaluate(f[1]))];
		}
	},
	RunFunc: function(x,n) {
		return this.func[n](x);
	},
	EvalConst: function(x) {
		return eval(this.const_parser.Evaluate(x));
	}
}

function Render() {
	// virtual choord rect (half size)
	this.rect = {x: 0, y: 0, width: 1, height: 1};
	this.viewport = {width: null, height: null};
	this.t_range = {start: 0, len: 1};
	this.density = 100;
	this.context = null;
	this.result = {
		visible_points: 0,
	};
}

Render.prototype = {
	Init: function(canvas) {
		this.canvas = canvas;
		this.context = this.canvas.getContext("2d");
		this.viewport.width = this.canvas.width;
		this.viewport.height = this.canvas.height;
	},
	SetResolution: function(w, h) {
		this.canvas.width = this.viewport.width = w;
		this.canvas.height = this.viewport.height = h;
		this.Flush();
	},
	SetRange: function(x_min, x_max, y_min, y_max, t_max, t_min, density) {
		if(!isNaN(x_min)) this.rect.x = x_min;
		if(!isNaN(x_max)) this.rect.width = x_max - this.rect.x;
		if(!isNaN(y_min)) this.rect.y = y_min;
		if(!isNaN(y_max)) this.rect.height = y_max - this.rect.y;
		if(!isNaN(t_min)) this.t_range.start = t_min;
		if(!isNaN(t_max)) this.t_range.len = t_max - t_min;
		if(!isNaN(density)) this.density = density;
	},
	DrawAxis: function() {
		var ctx = this.context;
		var vw = this.viewport.width,vh = this.viewport.height,
			w = this.rect.width, h = this.rect.height;
		var y_zero = (1 + this.rect.y / h) * vh;
		var x_zero = - this.rect.x / w * vw;
		ctx.beginPath();
		ctx.strokeStyle = "#b00";
		ctx.moveTo(0, y_zero);
		ctx.lineTo(vw, y_zero);
		ctx.stroke();
		ctx.beginPath();
		ctx.strokeStyle = "#00b";
		ctx.moveTo(x_zero, 0);
		ctx.lineTo(x_zero, vh);
		ctx.stroke();
	},
	DrawGraph: function(mode) {
		var ctx = this.context;
		ctx.fillStyle = "#fff";
		ctx.fillRect(0, 0, this.viewport.width, this.viewport.height);
		ctx.strokeStyle = "#333"
		ctx.lineWidth = 2;
		ctx.beginPath();
		var vw = this.viewport.width;
		var vh = this.viewport.height;
		var w = this.rect.width;
		var h = this.rect.height;
		var visible = true;
		var old_ix = NaN;
		var old_iy = NaN;
		var visible_points = 0;
		if(mode == "Explicit") {
			for(var ix = 0; ix <= vw; ix++) {
				var x = this.rect.x + ix * w / vw;
				var y = env.RunFunc(x, 0);
				var iy = (1 - (y - this.rect.y) / h ) * vh;
				//unexpected value
				if(isNaN(y) || !isFinite(y)) visible = false;
				else {
					var tmp_visible = 0 <= iy && iy <= vh;
					if(!ix && tmp_visible) ctx.moveTo(ix, iy);
					else if(!visible && tmp_visible) {
						ctx.moveTo(ix - 1, old_iy);
						ctx.lineTo(ix, iy);
					} else if(ix && visible) ctx.lineTo(ix, iy);
					visible = tmp_visible;
					if(visible) visible_points++;
				}
				old_iy = iy;
			}
		} else if (mode == "Parameter") {
			for(var it = 0; it <= this.density; it++) {
				var t = it / this.density * this.t_range.len + this.t_range.start;
				var x = env.RunFunc(t, 0), y = env.RunFunc(t, 1);
				var ix = (0 + (x - this.rect.x) / w ) * vw;
				var iy = (1 - (y - this.rect.y) / h ) * vh;
				if(isNaN(x) || !isFinite(x) || isNaN(y) || !isFinite(y)) visible = false;
				else {
					var tmp_visible = 0 <= iy && iy <= vh
									  0 <= ix && ix <= vw;
					if(!t && tmp_visible) ctx.moveTo(ix,iy);
					else if(!visible && tmp_visible) {
						ctx.moveTo(old_ix, old_iy);
						ctx.lineTo(ix, iy);
					} else if(ix && visible) ctx.lineTo(ix, iy);
					visible = tmp_visible;
					if(visible) visible_points++;
				}
				old_ix = ix, old_iy = iy;
			}
		}
		ctx.stroke();
		this.result.visible_points = visible_points;
	},
	Flush: function() {

	}
}

function Console() {
	this.elem = $(".console_viewer");
}

var env = new System();