function System() {
	// virtual choord rect (half size)
	this.rect = {x: 0, y: -1, width: Math.PI, height: 1};
	this.context = null;
}

System.prototype = {
	Init: function() {
		this.canvas = $("#main_canvas")[0];
		this.context = this.canvas.getContext("2d");
		var self = this;
		$("#button_evaluate").on("click", function() {
			self.Draw();
		});
		this.resolution = this.canvas.width;
	},
	Draw: function() {
		this.context.fillStyle = "#00f";
		this.context.fillRect( 0 , 0 , this.canvas.width , this.canvas.height );
		var cell_size = {
			width: this.rect.width * 2 / this.resolution,
			height: this.rect.height * 2 / this.resolution
		};
		var bitmap = this.context.getImageData(0, 0, this.resolution, this.resolution);
		var i = 0;
		for(var iy = 0; iy < this.resolution; iy ++) {
			for(var ix = 0; ix < this.resolution; ix++, i+=4) {
				var result = Math.pow(
					iy * cell_size.height + this.rect.y -
					Math.sin(ix * cell_size.width + this.rect.x), 2) < 0.0001;
				bitmap.data[i] = result ? 255 : 0;
			}
		}
		this.context.putImageData(bitmap, 0, 0);
	}
}

var env = new System();