class Trie {
  constructor(key, parent = null) {
    this.key = key;
    this.children = {};
    this.parent = parent;
    this.handlers = []
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
    let pathInFunction = path
    if (pathInFunction[0] === '') {
      pathInFunction = pathInFunction.splice(1)
    }
    if (path[path.length - 1] === '') {
      pathInFunction = pathInFunction.slice(0, -1)
    }
    //    console.log(path)
    let node = this;
    if (pathInFunction.length == 0){
      node.end = true;
      node.handlers.push( {'method':method,
        'constraints': constraints,
        'handler': handler,
        'path': pathInFunction
      })
    }
    for (let i = 0; i < pathInFunction.length; i++) {
      let correntWorld = pathInFunction[i]
      if (!node.children[correntWorld]) {
        node.children[correntWorld] = new Trie(correntWorld, node);
      }
      node = node.children[correntWorld];
      if (i === pathInFunction.length - 1) {
        node.end = true;
        node.handlers.push({ 'method':method,
          'constraints': constraints,
          'handler':handler,
          'path': pathInFunction })
      }
    }
  }
  checkPath(path, handler) {
    let found = true
    let params = new Array()
    for (let i = 0; i < path.length; i++){
      if (handler.path[i][0] === ':') {
        if (!this.checkPathern(handler.constraints,path[i],handler.path[i])){
          params[handler.path[i].substring(1)] = path[i]
          found = false
        }else{
          params[handler.path[i].substring(1)] = path[i]
        }
      }else{
        if (path[i] != handler.path[i] ){
          found = false
        }
      }
    }

    return [found, params]
  }
  checkPathern(patherns, value, key) {
    const parma_key =  key.substring(1)
    if ( (patherns !== undefined) && (patherns[parma_key])){
      const pathern = patherns[parma_key]
      if ( typeof(pathern) === 'function' ){
        if (!pathern(value)){
          return false
        }
      }else{
        if ( !value.match(pathern)) {
          return false
        }
      }

      return true
    }else{
      return true
    }
  }
  contains(path, requestMethod) {
    let node = this;
    let childrens = []
    childrens.push(node)
    for (let i = 0; i < path.length; i++) {
      const childrens_length = childrens.length
      for (let j = 0; j < childrens_length; j++){
        node = childrens.pop(0)
        if (node.children[path[i]] ) {
          childrens.push(node.children[path[i]])
        } else {
          for (let key in node.children){
            if (key[0] == ':'){
              childrens.push( node.children[key])
            }
          }
        }
      }
    }
    let allowed_methods = Array()
    let found = false
    let params = Array()
    for (let index in childrens){
      node = childrens[index]
      if (node.end){
        for (const handler_idx in  node.handlers){
          [found, params] = this.checkPath(path, node.handlers[handler_idx])
          if (found){
            if (node.handlers[handler_idx].method === undefined){
              allowed_methods.ALL = node.handlers[handler_idx]
              allowed_methods.ALL.params = params
            }else{
              allowed_methods[node.handlers[handler_idx].method] = node.handlers[handler_idx]
              allowed_methods[node.handlers[handler_idx].method].params = params
            }
          }
        }

      }
    }
    //    console.log(params)
    //    console.log("=============================")
    if (requestMethod in allowed_methods){
      return  [true, allowed_methods[requestMethod]['params'], allowed_methods[requestMethod]['handler']]
    }else if ('ALL' in allowed_methods){
      return  [true, allowed_methods['ALL']['params'], allowed_methods['ALL']['handler']];
    }else{
      return [false];
    }
  }
}

export default Trie