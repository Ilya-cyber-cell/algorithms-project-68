import Trie from './tree.js';

class Router {
  constructor(router) {
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
    console.log('=============================');
    console.log(request);
    const request_path = request['path']
    if (request_path == '') {
      throw 'no such path'
    }
    const request_method = request['method']
    let ret = ""
    let path_spited = request_path.split('/')
    if (path_spited[0] == ""){
      path_spited = path_spited.splice(1)
    }
    if (path_spited[path_spited.length-1] === '') {
      path_spited = path_spited.slice(0,-1)
    }
    let prefix_tree = this.prefix_tree
    let found = false
    const [path_found, params, handler] =  prefix_tree.contains(path_spited, request_method)
    found = path_found
    if ( !found ) {
      console.log('no such path');
      throw 'no such path'
    }
    console.log(params);
    console.log(handler);
    ret = {'path':request_path, 'handler':handler, 'method': request_method,'params':params};

    return ret
  }
}

export default (routers) => {
  const ret = new Router(routers);
  
  return ret;
}