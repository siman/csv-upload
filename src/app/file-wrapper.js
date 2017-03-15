export default function FileWrapper (file, encoding) {
  var self = this;

  self.readChunk = function (offset, length, callback) {
    //let lastPosition = offset + length;
    var reader = new FileReader();

    reader.onloadend = function(progress) {
      var buffer;
      if (reader.result) {
        buffer = new Int8Array(reader.result, 0);
        buffer.slice = buffer.subarray;
      }
      callback(progress.err, buffer, progress.loaded);
    };

    reader.readAsArrayBuffer(file.slice(offset, offset + length));
  };

  self.decode = function(buffer, callback) {
    var reader = new FileReader();
    reader.onloadend = function(progress) {
      callback(progress.currentTarget.result);
    };
    if (typeof encoding !== 'undefined') {
      reader.readAsText(new Blob([buffer]), encoding);
    } else {
      reader.readAsText(new Blob([buffer]));
    }
  };

  self.getSize = function() {
    return file.size;
  };
}

