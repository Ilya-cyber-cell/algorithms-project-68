class Trie {
  constructor(key, parent = null) {
      this.key = key;
      this.children = {};
      this.parent = parent;
      this.handler = ""
      this.method = 'GET'
      this.constraints = {}
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
    let node = this;
    for (let i = 0; i < path.length; i++) {
        if (!node.children[path[i]]) {
            node.children[path[i]] = new Trie(path[i], node);
        }
        node = node.children[path[i]];
        if (i === path.length - 1) {
            node.end = true;
            node.handler = handler
            node.method = method
            node.constraints = constraints
        }
    }
  }
  contains(path) {
    let node = this;
    let params = new Array()
    let handler = ""
    let method = ""
    let constraints = ""
    for (let i = 0; i < path.length; i++) {
        let param = -1
        for (let key in node.children){
          if (key[0] == ":"){
            param = key
            params[key] = path[i]
          }
        }
        if (node.children[path[i]] ) {
            node = node.children[path[i]];
        } else if( param != -1 ){
            node = node.children[param]
        } else {
            return [false, params, handler,method];
        }
    }
    handler = node.handler;
    method = node.method;
    constraints = node.constraints;
    return [node.end, params, handler, method, constraints]
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
      let path_list = router[i]['path'].split('/').splice(1)
      path_list.push(router[i]['method'])
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
    let path_spited = request_path.split('/').splice(1)
    path_spited.push(request_method)
    let prefix_tree = this.prefix_tree
    let found = false
    const [path_found, params, handler, method, constraints] =  prefix_tree.contains(path_spited)
    found = path_found
    for (const param in  params){
      const param_key = param.substring(1);
      const param_value = params[param];
      if (constraints[param_key]){
        const param_filter = constraints[param_key];
        if ( typeof(param_filter) == "function" ){
          if (!param_filter(param_value)){
            found = false
          }
        }else{
          if ( !param_value.match(param_filter)) {
            found = false
          }
        }
        if (request_method != method){
          found = false
        } 
        console.log(param);
        console.log(constraints[param.substring(1)]);
        console.log(typeof(constraints[param.substring(1)]));
      }
    }
    if ( !found ) {
      return  new Error("Path not found");
    }
    ret = {'path':request_path, 'handler':handler, 'method': method,'params':params };
    return ret
  }
}

function courses(){
  console.log("33332211111");
}

export default (routers) => {
  const ret = new Router(routers);
  return ret;
}

