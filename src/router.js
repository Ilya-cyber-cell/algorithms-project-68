function PathNotFoundException(message) {
  this.message = message;
  this.name = "no such path";
}

class Trie {
  constructor(key, parent = null) {
      this.key = key;
      this.children = {};
      this.parent = parent;
      this.handlers = []
      this.end = false;
  }

  getWord() {
      let output = [];
      let node = this;

      while (node !== null) {
          output.unshift(node.key);
          node = node.parent;
      }
      return output.join('');
  }
  insert(path, handler, method, constraints) {
    if (path[0] == ""){
      path = path.splice(1)
    }
    if (path[path.length-1] == ""){
      path = path.slice(0,-1)
    }
//    console.log(path)
    let node = this;
    if (path.length == 0){
      node.end = true;
      node.handlers.push({"method":method, 
        "constraints": constraints, 
        "handler":handler, 
        "path": path})
    }
    for (let i = 0; i < path.length; i++) {
        let corrent_world = path[i]
        if (!node.children[corrent_world]) {
            node.children[corrent_world] = new Trie(corrent_world, node);
        }
        node = node.children[corrent_world];
        if (corrent_world[0] == ":"){

        }
        if (i === path.length - 1) {
          node.end = true;
          node.handlers.push({"method":method, 
            "constraints": constraints, 
            "handler":handler, 
            "path": path})
        }
    }
  }
  check_path(path, handler){
    let found = true
    let params = Array()
    for (let i = 0; i < path.length; i++){
      if (handler.path[i][0] == ":"){
        if (!this.check_pathern(handler.constraints,path[i],handler.path[i])){
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
  check_pathern(patherns, value, key){
    const parma_key =  key.substring(1)
    if ( (patherns !== undefined) && (patherns[parma_key])){
      const pathern = patherns[parma_key]
      if ( typeof(pathern) == "function" ){
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
  contains(path, request_method) {
    let node = this;
    let childrens = []
    childrens.push(node)
    for (let i = 0; i < path.length; i++) {
        const childrens_length = childrens.length
        console.log("path : " +  path[i])
        for (let j = 0; j < childrens_length; j++){
            node = childrens.pop(0)
            if (node.children[path[i]] ) {
              console.log(path[i])
              childrens.push(node.children[path[i]])
            } else {
                for (let key in node.children){
                    if (key[0] == ":"){
                        console.log(key)
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
            [found, params] = this.check_path(path, node.handlers[handler_idx])
            if (found){
              if (node.handlers[handler_idx]['method'] === undefined){
                allowed_methods['ALL'] = node.handlers[handler_idx]
                allowed_methods['ALL']['params'] = params
              }else{
                allowed_methods[node.handlers[handler_idx]['method']] = node.handlers[handler_idx]
                allowed_methods[node.handlers[handler_idx]['method']]['params'] = params
              }
            }
          }

        }
    }
    console.log(params)
    console.log("=============================")    
    if (request_method in allowed_methods){
      return  [true, allowed_methods[request_method]['params'], allowed_methods[request_method]['handler']]
    }else if ('ALL' in allowed_methods){
      return  [true, allowed_methods['ALL']['params'], allowed_methods['ALL']['handler']];
    }else{
      return [false];
    }
  }
}

class Router {
  router;
  paths;
  prefix_tree;
  constructor(router) {
    this.router = []
    this.paths = []
    let prefix_tree = new Trie()
    for (const  i in router){
      console.log(router[i])
      let path_list = router[i]['path'].split('/')
      prefix_tree.insert(path_list, 
                         router[i]['handler'],
                         router[i]['method'],
                         router[i]['constraints']);
      this.prefix_tree = prefix_tree;
    }
  }
  serve(request){
    const request_path = request['path']
    const request_method = request['method']
    let ret = ""
    let path_spited = request_path.split('/')
    if (path_spited[0] == ""){
      path_spited = path_spited.splice(1)
    }
    if (path_spited[path_spited.length-1] == ""){
      path_spited = path_spited.slice(0,-1)
    }
    console.log(path_spited);
    let prefix_tree = this.prefix_tree
    let found = false
    const [path_found, params, handler] =  prefix_tree.contains(path_spited, request_method)
    found = path_found
    if ( !found ) {
//      return  new Error("no such path");
//      throw new PathNotFoundException("no such path")
      throw "no such path"
    }
    console.log(params);
    console.log(handler);
    ret = {'path':request_path, 'handler':handler, 'method': request_method,'params':params };
    return ret
  }
}



export default (routers) => {
  const ret = new Router(routers);
  return ret;
}

