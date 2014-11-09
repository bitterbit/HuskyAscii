function HuskyCompiler(){
    
    
    this.nameSet = ['A','I','C', 'S']
    this.renameObj = makeReplaceObj(this.nameSet);

    this.mainLetter = this.nameSet[0];
    this.seconderyLetter = this.nameSet[1];

    this.dictionary = this.generateDictionary();
    this.octalDictionary = (function(){var translate_arr=[]; for (i=0; i<200; i++){translate_arr.push(eval('"\\'+i+'"'));}; return translate_arr;})()

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

HuskyCompiler.prototype.getExpression = function(str) {
	var arr={};
	
	// a regex that finds all the precalculated strings in the given strings
	var regex = '/';
    for(var i in this.dictionary){
		var val = this.dictionary[i];
		if(typeof(val) == "function") continue; // we do not want `function(){ ... }` in our regex
        arr[val] = this.mainLetter+'.'+i;
		if (val == '\\') val = '\\\\'; // escaping
		regex += val + '|';
    }
	regex += '[^]/g';
	reg = eval(regex);
	var that = this;
	return this.putSymbolsInPlaceholders(str.replace(reg, function(match){
		var expr = arr[match];
		if(expr != undefined) return expr + '+';
		else return that.octalStringtoExpression(that.stringToOctal(match)) + '+';
	}).slice(0,-1));
}

HuskyCompiler.prototype.stringToOctal = function(str) {
    var translate_arr=this.octalDictionary;
    var msg = ''
    
    for(index in str){
        var ch = str[index]
        msg += '\\'+translate_arr.indexOf(ch);
    }
    return msg
};

HuskyCompiler.prototype.octalStringtoExpression = function(octalStr) {
    var dict=this.dictionary;
    var arr={};

    for (i in dict) {
        arr[dict[i]] = format('{0}.{1}',this.mainLetter,this.putSymbolsInPlaceholders(i+''));
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

HuskyCompiler.prototype.getExpressionShortcut = function(str) {
    var dict = this.dictionary;
    var arr={}; 
    for(i in dict){
        arr[dict[i]] = this.mainLetter+'.'+i;
    } 
    return arr[str];
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
    return codeStr.replace(/(_[SM])+/g, function(match){return ro.replaceReply(match)});
};



/*********** NAME REPLACER  ***********/

// an object used to make names using only the given nameset
function makeReplaceObj(names){
    return {
        id : [],  // identification
        nameSet: names, // all the names that will be used to assemble variable names 
        dict : {}, // holds the already determined variable names

        // creates a new name
        incr : function () 
        {
            for(var i = 0;;i++)
            {
                var ix = this.nameSet.indexOf(this.id[i])
                if(ix == this.nameSet.length - 1)
                {
                    this.id[i] = this.nameSet[0]
                }
                else
                {
                    this.id[i] = this.nameSet[ix + 1]
                    break;
                }
            }
            return this.id.join('');
        } ,
        
        // replaces an identifier with a new identifier using only the nameSet ; it returns the same identifier when given the same identifier (by storing past calls)
        replaceReply : function (match) { 
            if(this.dict[match])
            {
                return this.dict[match]
            }
            else
            {
                var x = this.incr()
                this.dict[match]=x;
                return x;
            }
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