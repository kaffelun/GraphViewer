function Parser(type) {
	this.name_func = {
		sin: "Math.sin",
		cos: "Math.cos",
		tan: "Math.tan",
		log: "(function(x,y){return y?Math.log(y)/Math.log(x):Math.log(x)})",
		abs: "Math.abs",
		gauss: "Math.floor",
		floor: "Math.floor",
		ceil: "Math.ceil",
		exp: "Math.exp",
		sqrt: "Math.sqrt",
		pow: "Math.pow",
		max: "Math.max",
		min: "Math.min"
	};
	this.name_const = {
		pi: "Math.PI",
		E: "Math.E"
	};
	this.operator = ['+','-','*','/','^','(',')',',']
	this.characters = /^[\x21-\x7E]+$/;
	this.numbers = /^[\x30-\x39]+$/;
	this.keyword = Object.keys(this.name_func).concat(
	               Object.keys(this.name_const).concat(this.operator));
	if(type != "const") this.keyword.push("x");
}

Parser.prototype = {
	ChangeVariable: function(character) {
		this.keyword.pop();
		this.keyword.push(character);
	},
	Evaluate: function(expression) {
		// To manage with embedded evaluate

		var self = this;
		// Parsing phase
		var words = [];
		var types = [];
		var buffer = "";
		var in_number = false;
		function register(t) {
			if(buffer == "") return;
			words.push(buffer);
			if(is_operator(buffer)) types.push("o");
			else if(~Object.keys(self.name_func).indexOf(buffer)) types.push("f");
			else if(~Object.keys(self.name_const).indexOf(buffer)) types.push("c");
			else if(is_numbers(buffer)) types.push("n");
			else types.push("n");
			buffer = "";
		}
		function parse_error() {
			console.log("Failed to evaluate!");
			return NaN;
		}
		function convert_error() {
			console.log("Failed to convert!");
			return NaN
		}
		var is_operator = function(x){ return ~self.operator.indexOf(x) };
		var is_keyword = function(x){ return ~self.keyword.indexOf(x) };
		var is_numbers = function(x){ return x.match(self.numbers) };
		var is_characters = function(x){ return x.match(self.characters) };
		for(var i = 0; i < expression.length; i++) {
			var c = expression[i];
			if(!is_characters(c)) continue;
			if(is_numbers(c)) {
				if(!in_number) {
					if(buffer != "") return parse_error();
					in_number = true;
				}
				buffer += c;
				continue;
			}
			if(in_number) {
				register();
				in_number = false;
			}
			buffer += c;
			if(is_keyword(buffer)) register();
		}
		if(is_keyword(buffer) || in_number) register();
		if(buffer != "") return parse_error();
		console.log(words);

		var eval_str = "", word = "";
		var implicit = false;
		function put_op(n, op) {
			words.splice(n,0,op);
			types.splice(n,0,"o");
		}
		for(var i = 0; i < words.length; i++) {
			word = words[i];
			next = words[i+1];
			next_type = types[i+1];
			switch(types[i]) {
				case "c":
					words[i] = this.name_const[word]; // continue
				case "n":
					if(next == "(" || next_type == "c" || next_type == "n" || next_type == "f") {
						put_op(++i, "*");
					}
					break;
				case "o":
					if(((i == 0 && word != "-" && word != "(") ||
						( next != "-" && next != "(" && word != ")" && next_type == "o"))) return convert_error();
					if(implicit) {
						implicit = false;
						put_op(i, ")");
					}
					if(word == ")" && next == "(") {
						put_op(++i, "*");
					}
					break;
				case "f":
					if(i == words.length - 1) return convert_error();
					words[i] = this.name_func[word];
					if(next != "(") {
						put_op(++i, "(");
						implicit = true;
					}
					break;
			}
		}
		if(implicit) {
			put_op(words.length,")");
		}
		console.log(words);
		return words.join('');
	}
}