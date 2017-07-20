
function System() {
}

System.prototype = {
	Init: function() {
		this.render = new Render();
		this.render.Init($("#main_canvas")[0]);
		this.parser = new Parser();
		this.const_parser = new Parser("const");
	},
	SetFunc: function(str) {
		// this is managed code.
		this.func = new Function("x", "return " + this.parser.Evaluate(str));
	},
	RunFunc: function(x) {
		return this.func(x);
	},
	EvalConst: function(x) {
		return eval(this.const_parser.Evaluate(x));
	}
}

function Render() {
	// virtual choord rect (half size)
	this.rect = {x: 0, y: 0, width: 1, height: 1};
	this.viewport = {width: null, height: null};
	this.context = null;
	this.result = {
		visible_points: 0,
	}
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
	SetRange: function(x_min, x_max, y_min, y_max) {
		if(x_min != null) this.rect.x = x_min;
		if(x_max != null) this.rect.width = x_max - this.rect.x;
		if(y_min != null) this.rect.y = y_min;
		if(y_max != null) this.rect.height = y_max - this.rect.y;
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
	DrawGraph: function() {
		var ctx = this.context;
		ctx.fillStyle = "#fff";
		ctx.fillRect(0, 0, this.viewport.width, this.viewport.height);
		ctx.strokeStyle = "#333"
		ctx.lineWidth = 2;
		ctx.beginPath();
		var w_inv = 1 / this.viewport.width;
		var h = this.viewport.height;
		var w = this.rect.width;
		var h_inv = 1 / this.rect.height;
		var visible = true;
		var old_iy = NaN;
		var visible_points = 0;
		for(var ix = 0; ix <= this.viewport.width; ix++) {
			var x = this.rect.x + ix * w_inv * w;
			var y = env.RunFunc(x);
			var iy = (1 - (y - this.rect.y) * h_inv ) * h;
			//unexpected value
			if(isNaN(y) || !isFinite(y)) visible = false;
			else {
				var tmp_visible = 0 <= iy && iy <= this.viewport.height;
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
		ctx.stroke();
		this.result.visible_points = visible_points;
	},
	Flush: function() {

	}
}


var env = new System();