
function HuskyCompiler(){
    this.nameSet = ['A','I','C','S']
    this.renameObj = Renamer(this.nameSet);

    this.dictionary = this.generateDictionary();

    this.dictionaryString = this.getDictionaryAsString();
    this.funcWrapper = this.putSymbolsInPlaceholders("_Function");
    this.returnString = this.putSymbolsInPlaceholders('_returnS'); 
    
    this.quote = this.putSymbolsInPlaceholders('_quote');
}


HuskyCompiler.prototype.Compile = function(javascript_code) {
    var mainCodeString = this.getExpression(escape(javascript_code,"'"));
    var wrappedMainCode = format("{1}({1}({2}+{3}+{0}+{3})())()",mainCodeString, this.funcWrapper, this.returnString, this.quote);
    return this.dictionaryString + wrappedMainCode; 
};

// compile javascript_code in a way that the code itself is contained in the variable quine_name to be accessed by the code.
HuskyCompiler.prototype.CompileQuineable = function(javascript_code, quine_name) {
    return this.CompileQuineableHusky(javascript_code, quine_name, this.dictionaryString);
};

// compile quineably using a predefined dict
HuskyCompiler.prototype.CompileQuineableHusky = function(javascript_code, quine_name, husky_dict)
{
    // How many Slashes do you need to replace a light bulb?
    javascript_code = format("{2}=(\"{0}\"+({3}+\\'\\').replace(/\\/\\*(?= )/g,\\'/*\\\\\\\\\\\\n\\')+\\';{3}()\\').replace(/fu.+{[^]/,\\'{3}={1}(\"\\').replace(/[^{)+/]+}/,\\'\")\\');"
							, escape(escape(husky_dict,'"'),"'")
							, this.funcWrapper
							, quine_name
							, this.putSymbolsInPlaceholders("_unusedName")) + escape(javascript_code,"'");
	
    var mainCodeString = this.getExpression(javascript_code);
	
    console.log(javascript_code);
	
    return format("{4}{5}={1}(\"({1}({1}({2}+{3}+{0}+{3})()))()\");{5}()"
							, mainCodeString
							, this.funcWrapper
							, this.returnString
							, this.quote
							, this.dictionaryString
							, this.putSymbolsInPlaceholders("_unusedName"));
}

// father function to get an obfuscated expression.
// converts js expression, as alert, to its equivalent obfuscated value. 
// should always satisfy unescape(eval(getExpression(s))) = s
HuskyCompiler.prototype.getExpression = function(str) {
    var arr={};
    
    // building a regex that finds all the precalculated strings in the given strings
    var regex = '';
    for(var i in this.dictionary){
        var val = this.dictionary[i];
        if(typeof(val) == "function" || val == "" || val == "'") continue; // we do not want `function(){ ... }` in our regex, nor we want an empty string.
        arr[val] = i;
        if (val == '\\') val = '\\\\'; // escaping
        regex += val + '|';
    }
	
    regex += '[^]';
	console.log("regex: " + regex);
    // turn string into regex
    regex = new RegExp(regex,"g");

    var that = this;
    return this.putSymbolsInPlaceholders(str.replace(regex, function(match){
        var expr = arr[match];
		if(match == "'")
			return '_quote+'; // escaping problems
        if(expr != undefined) 
            return expr + '+';
        else 
            return that.octalStringtoExpression(that.stringToOctal(match)) + '+';
    }).slice(0,-1));
}

// converts a string to it octal representation 
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

// converts octal string to obfuscated expression for example, if the variables were B='\\', AB='1', BB='0' 
// then: '\110' => 'B+AB+AB+BB'
HuskyCompiler.prototype.octalStringtoExpression = function(octalStr) {
    var dict=this.dictionary;
    var arr={};

    for (i in dict) {
        arr[dict[i]] = this.putSymbolsInPlaceholders(i+'');
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

HuskyCompiler.prototype.namesDictionary = {
    _M:"+[]",       // used a lot so give it a small name
	               // has a value of 9 at the end
    _A:"[]",        // empty A-rray
    _S:"''",        // empty S-tring
    _slash:"'\\\\'", // '\\'

    _f:"(!_A+_S)[_M]",
    _zero:"_M++",
    _a:"(!_A+_S)[_M]",
    _one:"_M++",
    _b:"({}+_S)[_M]",
    _d:"((_A[_zero])+_S)[_M]",
    _two:"_M++",
    _three:"_M++",
    _e:"(!_A+_S)[_M]",
    _four:"_M++",
    _c:"({}+_S)[_M]",
    _five:"_M++",
    _six:"_M++",
    _qSpace:"([]+{})[_M]",
    _space:"(_qSpace=(_qSpace+=(_space=_qSpace))+_qSpace+_qSpace+_qSpace,_space)",
    _seven:"_M++",
    _eight:"_M++",
    
    _quote:"'\\''", // '\''
    _returnS:"(!!_A+_S)[_one]+_e+(!!_A+_S)[_zero]+(!!_A+_S)[_two]+(!!_A+_S)[_one]+((_A[_zero])+_S)[_one]",
    _constr:"_c+(({}+_S)+_S)[_one]+((_A[_zero])+_S)[_one]+(!_A+_S)[_three]+(!!_A+_S)[_zero]+(!!_A+_S)[_one]+(!!_A+_S)[_two]+_c+(!!_A+_S)[_zero]+(({}+_S)+_S)[_one]+(!!_A+_S)[_one]",
    _Function:"_one[_constr][_constr]"
};

HuskyCompiler.prototype.generateDictionary = function() {
	var dict = {};
	for (name in this.namesDictionary) {
		eval ("var " + name + " = " + this.namesDictionary[name] + " ; "); // var for avoiding polluting the namespace. variables are kept in the local scope of this function.
	}
	for(name in this.namesDictionary) { // this loop has to run completely independently from the previous loop because some of the computations might have side effecs,
		dict[name] = eval(name);        // and so we need to store their last state.
	}
	return dict;
}

HuskyCompiler.prototype.getDictionaryAsString = function() {
	var code = "";
	for (name in this.namesDictionary) {
		code += name + "=" + this.namesDictionary[name]+";";
	}
    
    return this.putSymbolsInPlaceholders(code);
};

// CR: could i calling this function is equal to calling Renamer.renameExpression on all expressions in codeStr?
// maybe a better name would make it easier to understand
HuskyCompiler.prototype.putSymbolsInPlaceholders = function(codeStr) {
    var ro = this.renameObj
    // CR: why SMK? cant we do A-Z 
    return codeStr.replace(/_[a-zA-Z]+/g, function(match){return ro.renameExpression(match)});
};


/*********** NAME REPLACER  ***********/

// an object used to make names using only the given nameset
function Renamer(names){
    return {
        availLetters: names,    // all the letters than can be used. a letter can actually be more than one actual letter, aka 'ABC'
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

function escape(str, quote) {
	return str.replace(/\\/g,"\\\\").replace(new RegExp(quote,"g"),"\\"+quote);
}

function format(format){
    var args=[]; for(a in arguments){args.push(arguments[a])};
    args = args.slice(1);
    return format.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined' ? args[number] : match;
    });
}