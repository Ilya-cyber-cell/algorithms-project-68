class Trie {
  constructor(key, parent = null) {
      this.key = key;
      this.children = {};
      this.parent = parent;
      this.handler = ""
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
  insert(path, handler) {
    let node = this;
    for (let i = 0; i < path.length; i++) {
        if (!node.children[path[i]]) {
            node.children[path[i]] = new Trie(path[i], node);
        }
        node = node.children[path[i]];
        if (i === path.length - 1) {
            node.end = true;
            node.handler = handler
        }
    }
  }
  contains(path) {
    let node = this;
    let params = new Array()
    let handler = ""
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
            return [false, params, handler];
        }
    }
    handler = node.handler 
    return [true, params, handler]
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
      prefix_tree.insert(router[i]['path'].split('/').splice(1), router[i]['handler']);
      this.prefix_tree = prefix_tree;
    }
  }
  serve(path){
    console.log("============")
    let ret = ""
    let path_spited = path.split('/').splice(1)
    let prefix_tree = this.prefix_tree
    const [path_found, params, handler] =  prefix_tree.contains(path_spited)
    if ( !path_found ) {
      return  new Error("Path not found");
    }
    ret = {'path':path, 'handler':handler, 'params':params };
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

