import StackTrace from 'stacktrace-js';

(function (send) {
  XMLHttpRequest.prototype.send = function (body) {
    console.log('intercepted');
    StackTrace.get()
      .then((stackframes) => {
        const stringifiedStack = stackframes.map(sf => sf.toString()).join('\n');
        console.log(stringifiedStack);
        // console.log('somebody just called a send xhr', stack.slice(-1)[0].functionName,
        // stack.slice(-1)[0].fileName, 'body', body);
      })
      .catch((err) => {
        console.log('stacktrace err', err.message);
      });
    send.call(this, body);
  };
}(XMLHttpRequest.prototype.send));
