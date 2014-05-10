var DNA = require("organic").DNA
var util = require("util")
var glob = require("glob");
var fs = require("fs");
var path = require("path");

module.exports = function(data){
  DNA.call(this, data)
}


util.inherits(module.exports, DNA);

module.exports.prototype.loadDir = function(dirPath, namespace, callback) {
  if(typeof namespace == "function") {
    callback = namespace;
    namespace = "";
  }

  dirPath = path.normalize(dirPath);

  var self = this;
  glob(dirPath+"/**/*.json", function(err, files){
    if(err) return callback(err)
    var filesLeft = files.length;
    if(filesLeft == 0)
      return callback()
    files.forEach(function(file){
      file = path.normalize(file);
      // append namespace tail from file path
      // tail is in form X.Y.Z where '.' are path delimiters
      var target = file.replace(dirPath+path.sep, "").replace(".json", "").replace(/\//g, ".").replace(/\\/g, ".");

      if(namespace != "")
        target = namespace+"."+target; // insert '.' as namespace should be in form X.Y.Z without trailing '.'
      
      // load file data at given namespaced branch
      self.loadFile(file, target, function(err){
        if(err) return callback(err)
        filesLeft -= 1;
        if(filesLeft == 0)
          callback();
      });
    });
  });
}

module.exports.prototype.loadFile = function(filePath, namespace, callback){
  if(typeof namespace == "function") {
    callback = namespace;
    namespace = "";
  }
  var self = this;
  fs.readFile(filePath, function(err, data){
    if(err) return callback(err)
    data = data.toString();
    try {
      data = JSON.parse(data);
    }catch(e) {
      return callback(new Error("Failed to parse "+data+" at "+filePath))
    }
    self.createBranch(namespace, data);
    callback();
  });
}