function HuskyCompiler(){
    this.nameSet = ['A','I','C','S']
    this.renameObj = Renamer(this.nameSet);

    this.mainLetter = this.nameSet[0];
    this.seconderyLetter = this.nameSet[1];

    this.dictionary = this.generateDictionary();

    this.funcWrapper = format('{0}.{0}',this.mainLetter);
    this.dictionaryString = this.getDictionaryAsString();
    this.returnString = this.getExpression('return'); 
    this.quote = this.seconderyLetter;

}


HuskyCompiler.prototype.Compile = function(javascript_code) {
    var mainCodeString = this.getExpression(javascript_code);
    var wrappedMainCode = format("{1}({1}({2}+{3}+{0}+{3})())()",mainCodeString, this.funcWrapper, this.returnString, this.quote);
    return this.dictionaryString+wrappedMainCode; 
};

// compile javascript_code in a way that the code itself is contained in the variable quine_name to be accessed by the code.
HuskyCompiler.prototype.CompileQuineable = function(javascript_code, quine_name) {
	return this.CompileQuineableHusky(javascript_code, quine_name, this.dictionaryString);
};

// compile quineably using a predefined dict
HuskyCompiler.prototype.CompileQuineableHusky = function(javascript_code, quine_name, husky_dict)
{
    // How many Slashes do you need to replace a light bulb?
	javascript_code = format("{2}=(\"{0}\"+({3}+'').replace(/\\/\\*(?= )/g,'/*\\\\\\\\\\\\n')+';{3}()').replace(/fu.+{[^]/,'{3}={1}(\"').replace(/[^{)+/]+}/,'\")');", husky_dict.replace(/'\\\\'/g, "\\'\\\\\\\\\\\\\\\\\\\\'").replace(/'\\''/g,"\\'\\\\\\\\\\'\\'"), this.funcWrapper, quine_name, this.putSymbolsInPlaceholders("_M_S_S_M_S_M_M_S_M")) + javascript_code;
	console.log(javascript_code)
    var mainCodeString = this.getExpression(javascript_code);
    return format("{4}{5}={1}(\"({1}({1}({2}+{3}+{0}+{3})()))()\");{5}()",mainCodeString, this.funcWrapper, this.returnString, this.quote, this.dictionaryString, this.putSymbolsInPlaceholders("_M_S_S_M_S_M_M_S_M"));
}

// father function to get an obfuscated expression.
// converts js expression, as alert, to its equivelent obfuscated value. 
HuskyCompiler.prototype.getExpression = function(str) {
	var arr={};
	
	// building a regex that finds all the precalculated strings in the given strings
	var regex = '/';
    for(var i in this.dictionary){
		var val = this.dictionary[i];
		if(typeof(val) == "function") continue; // we do not want `function(){ ... }` in our regex
        arr[val] = this.mainLetter+'.'+i;
		if (val == '\\') val = '\\\\'; // escaping
		regex += val + '|';
    }
	regex += '[^]/g';
    // run regex
	reg = eval(regex);

	var that = this;
	return this.putSymbolsInPlaceholders(str.replace(reg, function(match){
		var expr = arr[match];
		if(expr != undefined) 
            return expr + '+';
		else 
            return that.octalStringtoExpression(that.stringToOctal(match)) + '+';
	}).slice(0,-1));
}

// converts a string to it octal represantation 
// for example: 'H' => '\110' 
HuskyCompiler.prototype.stringToOctal = function(str) {
    
    function decToOctal(decimal){
        if (decimal < 0)
            decimal = 0xFFFFFFFF + decimal + 1;
        return parseInt(decimal, 10).toString(8)
    }
    
    var msg = ''
    for(index in str){
        msg += '\\'+decToOctal(str[index].charCodeAt(0));
    }

    return msg
};

// converts octal string to obfuscated expression for example, if the dictionary was A={B:'\\', AB:'1', BB:'0'} 
// then: '\110' => 'A.B+A.AB+A.AB+A.BB'
HuskyCompiler.prototype.octalStringtoExpression = function(octalStr) {
    var dict=this.dictionary;
    var arr={};

    for (i in dict) {
        arr[dict[i]] = format('{0}.{1}', this.mainLetter, this.putSymbolsInPlaceholders(i+''));
    } 

    chars = [];
    for(index in octalStr){
        ch = octalStr[index];
        if(typeof ch == 'string' && arr[ch] != undefined){
            chars.push(arr[ch]);
        }
    }
    return chars.join('+');
};

// the dictionary ; used both in the compiled code (by getDictionaryAsString()) and in the compiler itself
HuskyCompiler.prototype.generateDictionary = function() {
    _M=+[];
	_S='\'';
    _M_M=[];
    _M_S='';
    _M={
		_S_S:[],
        _M_M_M_M:(!_M_M+_M_S)[_M],
        _S_S_S:_M++,
        _M_S_M_S:(!_M_M+_M_S)[_M],
        _S_S_M:_M++,
        _M_S_M_M:({}+_M_S)[_M],
        _M_M_S_M:((_M_M[+_M_M])+_M_S)[_M],
        _S_M_S:_M++,
        _S_M_M:_M++,
        _M_M_M_S:(!_M_M+_M_S)[_M],
        _M_S_S:_M++,
        _M_M_S_S:({}+_M_S)[_M],
        _M_S_M:_M++,
        _M_M_S:_M++,
		_S:([]+{})[_M],
        _M_M_M:_M++,
        _M_S_S_S:_M++,
        _M_S_S_M:_M++
    };
	_M._S+=_M._S;
	_M._S_S=_M._S+_M._S+_M._S+_M._S+_M._S;
    _M._S_M='\\';
    _M._M_M=(!!_M_M+_M_S)[_M._S_S_M]+_M._M_M_M_S+(!!_M_M+_M_S)[_M._S_S_S]+(!!_M_M+_M_S)[_M._S_M_S]+(!!_M_M+_M_S)[_M._S_S_M]+((_M_M[+_M_M])+_M_S)[_M._S_S_M];
    _M._M_S=_M._M_M_S_S+(({}+_M_S)+_M_S)[_M._S_S_M]+((_M_M[+_M_M])+_M_S)[_M._S_S_M]+(!_M_M+_M_S)[_M._S_M_M]+(!!_M_M+_M_S)[_M._S_S_S]+(!!_M_M+_M_S)[_M._S_S_M]+(!!_M_M+_M_S)[_M._S_M_S]+_M._M_M_S_S+(!!_M_M+_M_S)[_M._S_S_S]+(({}+_M_S)+_M_S)[_M._S_S_M]+(!!_M_M+_M_S)[_M._S_S_M];
    _M._M=_M._S_S_M[_M._M_S][_M._M_S];
    return _M;
};

HuskyCompiler.prototype.getDictionaryAsString = function() {
	
    var func = this.generateDictionary+'';
    
    var lines = func.split('\n');
    lines = lines.slice(1, lines.length-2);
    code = lines.join('').replace(/ +/g, '').replace('\t', '').replace(/(\r\n|\n|\r)/gm,"");
    
    return this.putSymbolsInPlaceholders(code);
};


HuskyCompiler.prototype.putSymbolsInPlaceholders = function(codeStr){
    var ro = this.renameObj
    return codeStr.replace(/(_[SM])+/g, function(match){return ro.renameExpression(match)});
};



/*********** NAME REPLACER  ***********/

// an object used to make names using only the given nameset
function Renamer(names){
    return {
        availLetters: names,    // all the letters than can be used. a letter can actually be more than one actuall letter, aka 'ABC'
        renameHistory : {},     // holds the already renamed expressions
        prevLetters : [],       // the letters that built the last expression

        // replaces an expression with a new expression using only the availLetters 
        // it returns the same expression when given the same expression (by storing past calls)
        renameExpression : function (exp) { 
            if (this.renameHistory[exp]) {
                return this.renameHistory[exp]
            }
            else {
                var newName = this.createNewName()
                this.renameHistory[exp] = newName;
                return newName;
            }
        },

        // get a new name, one that was not used ever before
        createNewName : function () {
            this.prevLetters = this.increaseWord(this.prevLetters)
            console.log(this.prevLetters)
            return this.prevLetters.join('');
        },

        increaseWord : function (wordLetters){
            if (wordLetters.length <= 0)
                return [this.availLetters[0]]

            letter = wordLetters[0];

            // if not last letter available, increase it
            if (!this.isLetterTheLastAvailable(letter)){
                wordLetters[0] = this.getNextLetter(letter)
            } 
            
            // increase the next letter. if all of the next cannot be increased, reset them and this letter.
            else {
                otherLetters = wordLetters.slice(1)
                newOtherLetters = this.increaseWord(otherLetters)
                if (newOtherLetters.length != otherLetters){
                    letter = this.getNextLetter()
                }
                newOtherLetters.unshift(letter)
                wordLetters = newOtherLetters
            }
            return wordLetters
        },

        // is the given letter the last letter available in availLetter
        isLetterTheLastAvailable : function (letter) {
            index = this.availLetters.indexOf(letter)
            return index == this.availLetters.length-1
        },

        // get the next available letter after a given letter, if is last letter will return the first letter 
        getNextLetter : function(letter) {
            currentIndex = this.availLetters.indexOf(letter)
            return this.availLetters[(currentIndex + 1) % this.availLetters.length]
        }
    }
}

/*********** STRINGS ***********/

function format(format){
    var args=[]; for(a in arguments){args.push(arguments[a])};
    args = args.slice(1);
    return format.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined' ? args[number] : match;
    });
}