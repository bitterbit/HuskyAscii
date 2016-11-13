function HACompiler(huskyCompiler, pictureBaker){
    this.huskyCompiler = huskyCompiler;
    this.pictureBaker = pictureBaker;
}

HACompiler.prototype.Compile = function(jscode) {  
    var pic_dictionary = this.pictureBaker.BakePartialPicture(this.huskyCompiler.getDictionaryAsString());
    var finalQuinableCode = this.huskyCompiler.CompileQuineableHusky(javascript, "quine", pic_dictionary.split('\n').join('\\\\n'));
    var finalQuinablePic = this.pictureBaker.BakePicture(finalQuinableCode);

    // TODO: add /*\ to the end of the quine lines
    //       add */ to the beginning of the lines
    //       add "  " to beginning of all lines
    
    eval(finalQuinablePic);
};