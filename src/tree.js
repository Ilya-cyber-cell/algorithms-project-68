class Trie {
  constructor(key, parent = null) {
    this.key = key;
    this.children = {};
    this.parent = parent;
    this.handlers = [];
    this.end = false;
  }

  getWord() {
    const output = [];
    let node = this;

    while (node !== null) {
      output.unshift(node.key);
      node = node.parent;
    }

    return output.join('');
  }

  insert(path, handler, method, constraints) {
    const pathInFunction = path;
    if (pathInFunction[0] === '') {
      pathInFunction.shift();
    }
    if (path[path.length - 1] === '') {
      pathInFunction.pop();
    }
    //    console.log(path)
    let node = this;
    if (pathInFunction.length === 0) {
      node.end = true;
      node.handlers.push({
        method,
        constraints,
        handler,
        path: pathInFunction,
      });
    }
    for (let i = 0; i < pathInFunction.length; i += 1) {
      const correntWorld = pathInFunction[i];
      if (!node.children[correntWorld]) {
        node.children[correntWorld] = new Trie(correntWorld, node);
      }
      node = node.children[correntWorld];
      if (i === pathInFunction.length - 1) {
        node.end = true;
        node.handlers.push({
          method,
          constraints,
          handler,
          path: pathInFunction,
        });
      }
    }
  }

  checkPath(path, handler) {
    let found = true;
    const params = [];
    for (let i = 0; i < path.length; i += 1) {
      if (handler.path[i][0] === ':') {
        if (!this.checkPathern(handler.constraints, path[i], handler.path[i])) {
          params[handler.path[i].substring(1)] = path[i];
          found = false;
        } else {
          params[handler.path[i].substring(1)] = path[i];
        }
      } else if (path[i] !== handler.path[i]) {
        found = false;
      }
    }

    return [found, params];
  }

  checkPathern(patherns, value, key) {
    const parmaKey = key.substring(1);
    if ((patherns !== undefined) && (patherns[parmaKey])) {
      const pathern = patherns[parmaKey];
      if (typeof (pathern) === 'function') {
        if (!pathern(value)) {
          return false;
        }
      } else if (!value.match(pathern)) {
        return false;
      }

      return true;
    }
    return true;
  }

  contains(path, requestMethod) {
    let node = this;
    const childrens = [];
    childrens.push(node);
    for (let i = 0; i < path.length; i += 1) {
      const childrensLength = childrens.length;
      for (let j = 0; j < childrensLength; j += 1) {
        node = childrens.pop(0);
        if (node.children[path[i]]) {
          childrens.push(node.children[path[i]]);
        } else {
          //for (const key in node.children) {
          //  if (key[0] === ':') {
          //    childrens.push(node.children[key]);
          //  }
          Object.keys(node.children).forEach(function(key) {
            if (key[0] === ':') {
              childrens.push(node.children[key]);
            }       
          })
        }
      }
    }
    const allowedMethods = {};
    let found = false;
    let params = {};
    for (const index in Object.keys(childrens)) {
      node = childrens[index];
      if (node.end) {
        for (const handlerIdx in Object.keys(node.handlers)) {
          [found, params] = this.checkPath(path, node.handlers[handlerIdx]);
          if (found) {
            if (node.handlers[handlerIdx].method === undefined) {
              allowedMethods.ALL = node.handlers[handlerIdx];
              allowedMethods.ALL.params = params;
            } else {
              allowedMethods[node.handlers[handlerIdx].method] = node.handlers[handlerIdx];
              allowedMethods[node.handlers[handlerIdx].method].params = params;
            }
          }
        }
      }
    }
    //    console.log(params)
    //    console.log("=============================")
    if (requestMethod in allowedMethods) {
      return [true, allowedMethods[requestMethod].params, allowedMethods[requestMethod].handler];
    } 
    if ('ALL' in allowedMethods) {
      return [true, allowedMethods.ALL.params, allowedMethods.ALL.handler];
    }
    return [false];
  }
}

export default Trie;
