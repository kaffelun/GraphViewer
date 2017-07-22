function Parser(type) {
	this.name_func = {
		sin: "Math.sin",
		cos: "Math.cos",
		tan: "Math.tan",
		log: "(function(x,y){return y?Math.log(x)/Math.log(y):Math.log(x)})",
		abs: "Math.abs",
		gauss: "Math.floor",
		floor: "Math.floor",
		ceil: "Math.ceil",
		exp: "Math.exp",
		sqrt: "Math.sqrt",
		max: "Math.max",
		min: "Math.min"
	};
	this.name_const = {
		pi: "Math.PI",
		e: "Math.E"
	};
	this.operator = ['+','-','*','/','%','^','(',')',',']
	this.characters = /^[\x21-\x7E]+$/;
	this.numbers = /^[\x30-\x39]+$/;
	this.keyword = Object.keys(this.name_func).concat(
	               Object.keys(this.name_const).concat(this.operator));
	if(type != "const") this.keyword.push("x");
	this.error_message = "";
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
					if(buffer != "" && buffer != "-") return parse_error();
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
			if(is_keyword(buffer) && !(expression.slice(i,3) == "exp")) register();
		}
		if(is_keyword(buffer) || in_number) register();
		if(buffer != "") return parse_error();
		console.log(words);

		var eval_str = "", word = "";
		var implicit = 0;
		var bracket_stack = [0];
		var connectional_mul = [];
		function put_op(n, op) {
			words.splice(n,0,op);
			types.splice(n,0,"o");
		}
		function solve_implicit() {
			while(implicit-- > 0) put_op(i, ")");
		}
		function begin_power() {
			var last_bracket = bracket_stack.pop();
			words.splice(last_bracket, 0, "Math.pow", "(");
			types.splice(last_bracket, 0, "f",        "o");
			in_power = true;
			power_next_flag = true;
			power_stack.push(last_bracket);
		}
		function end_power(n) {
			words.splice(n, 0, ")");
			types.splice(n, 0, "o");
			power_stack.pop();
		}

		function tacit_multiply(n) {
			var left = words[n], right = words[n+1], left_t = types[n], right_t = types[n+1];
			return (left_t == "c" || left_t == "n" || left_t == "f" || left == ")") &&
			(right_t == "c" || right_t == "n" || right_t == "f" || right == "(");
		}

		// replace
		for(var i = 0; i < words.length; i++) {
			var word = words[i], type = types[i];
			switch(type) {
				case "c":
					words[i] = this.name_const[word];
					types[i] = "n";
					break;
				case "f":
					words[i] = this.name_func[word];
			}
		}
		// negative number
		var i = -1;
		while(true) {
			i = words.indexOf("-", i + 1);
			if(i == -1) break;
			if( ( i == 0 || ( types[i-1] == "o" && words[i-1] != ")" ) ) &&
					(types[i+1] == "n" || words[i+1] == "(") ) {
				words.splice(i,1);
				types.splice(i,1);
				words[i] = "-" + words[i];
				i--;
			}
		}
		console.log("n:"+words);

		var guard = false;
		for(var i = 0; i < words.length; i++) {
			var word = words[i], type = types[i];
			switch(type) {
				case "n":
					if(implicit && types[i+1] == "f") {
						put_op(++i, ")");
						implicit--;
					}
					// tacit multiply
					if(tacit_multiply(i)) {
						if(words[i+1] != "(") {
							put_op(i++, "(");
							implicit++;
						}
						put_op(++i, "*");
					}
					break;
				case "f":
					if(words[i+1] != "(") {
						put_op(++i, "(");
						implicit++;
					}
					break;
				case "o":
					if(implicit) {
						put_op(i++, ")");
						implicit--;
					}
					if(word == ")" && tacit_multiply(i)) {
						put_op(++i, "(");
						put_op(++i, "*");
						implicit++;
					}
			}
		}
		solve_implicit();
		console.log("r:"+words.join(''));

		// power
		var i = -1, n = -1;
		function getCounterpart(w, x, dif) {
			var bracket = 1;
			while(bracket > 0 && 0 < x && x < words.length) {
				if(words[x] == "(") bracket += dif;
				if(words[x] == ")") bracket -= dif;
				x += dif;
			}
			return x;
		}
		while(true) {
			i = words.indexOf("^", i + 1);
			if(i == -1) break;
			words[i] = ",";
			if(words[i-1] == ")") n = getCounterpart(words, i-2, -1);
			else n = types.lastIndexOf("o",i - 1) + 1;
			if(words[n] == "(") n--;
			if(n < 0) n = 0;
			words.splice(n, 0, "Math.pow", "(");
			types.splice(n, 0, "f", "o");
			i += 2;
			if(words[i+1] == "(") n = getCounterpart(words, i+2, +1);
			else n = types.indexOf("o",i + 1);
			if(n == -1) n = words.length;
			words.splice(n, 0, ")");
			types.splice(n, 0, "o");
		}

		console.log(words);
		console.log("p:"+words.join(''));
		return words.join('');
	}
}