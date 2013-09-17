var expectError = function(messageRegex, callback) {
  var err = null;
  try {
    callback();
  } catch(e) {
    err = e;
  }
  if (err) {
    if (!messageRegex.test(err.toString())) {
      throw new Error('error didn\'t match: expected '+ messageRegex.toString() + ' but was ' + err.toString());
    }
  } else {
    throw new Error('fail');
  }
}

exports.expectError = expectError;
