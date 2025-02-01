class Trie {
  constructor(key, parent = null) {
      this.key = key;
      this.children = {};
      this.parent = parent;
      this.handler = ""
      this.methods = {}
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
    if (path[0] == ""){
      path = path.splice(1)
    }
    if (path[path.length-1] == ""){
      path = path.slice(0,-1)
    }
//    console.log(path)
    let node = this;
    for (let i = 0; i < path.length; i++) {
        let corrent_world = path[i]
        if (corrent_world[0] == ":"){
          if (!node.children[corrent_world]) {
            node.children[corrent_world] = new Trie(corrent_world, node);
          }
          node = node.children[corrent_world];
          if (typeof method === 'undefined'){
            corrent_world = "ALL"
          } else {
            corrent_world = method
          }
        }
        if (!node.children[corrent_world]) {
            node.children[corrent_world] = new Trie(corrent_world, node);
        }
        node = node.children[corrent_world];
        node.constraints = constraints;
        if (i === path.length - 1) {
          node.end = true;
          if (typeof method === 'undefined'){
              node.handler = handler;
          } else {
              node.methods[method] = {"handler": handler, "constraints":constraints}
          }
        }
    }
  }
  check_pathern(patherns, value, key){
    const parma_key =  key.substring(1)
    if (patherns[parma_key]){
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
      return false
    }
  }
  contains(path, request_method) {
    let node = this;
    let params = new Array()
    let handler = ""
    let method = ""
    let constraints = ""
    for (let i = 0; i < path.length; i++) {
        let param = -1
        let node_parmas
        for (let key in node.children){
          if (key[0] == ":"){
            for (let avaiable_method in node.children[key].children){

              if (this.check_pathern(node.children[key].children[avaiable_method].constraints, path[i], key)){
                console.log(avaiable_method)
                param = avaiable_method
                params[key] = path[i]
                node_parmas = node.children[key]     
              }
            }
          }
        }
        if (node.children[path[i]] ) {
            node = node.children[path[i]];
        } else if( param != -1 ){
            node = node_parmas.children[param]
        } else {
            return [false, params, handler,method, constraints];
        }
    }
    if (request_method in node.methods){
      handler = node.methods[request_method].handler;
      constraints = node.methods[request_method].constraints;
    }else{
      handler = node.handler;
      constraints = node.constraints;
    }
    return [node.end, params, handler, request_method, constraints]
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
    const [path_found, params, handler, method, constraints] =  prefix_tree.contains(path_spited, request_method)
    found = path_found
    if ( !found ) {
      return  new Error("Path not found");
    }
    console.log(params);
    console.log(handler);
    ret = {'path':request_path, 'handler':handler, 'method': method,'params':params };
    return ret
  }
}



export default (routers) => {
  const ret = new Router(routers);
  return ret;
}

