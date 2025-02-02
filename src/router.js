import Trie from './tree.js';

class Router {
  constructor(router) {
    const prefixTree = new Trie()
    for (const i in Object.keys(router)){
      const pathList = router[i].path.split('/')
      prefixTree.insert(pathList,
        router[i].handler,
        router[i].method,
        router[i].constraints);
      this.prefixTree = prefixTree;
    }
  }
  serve(request){
//    console.log('=============================');
//    console.log(request);
    const request_path = request.path
    if (request_path == '') {
      throw 'no such path'
    }
    const requestMethod = request.method
    let ret = ''
    let pathSpited = request_path.split('/')
    if (pathSpited[0] === '') {
      pathSpited = pathSpited.splice(1)
    }
    if (pathSpited[pathSpited.length-1] === '') {
      pathSpited = pathSpited.slice(0,-1)
    }
    let prefixTree = this.prefixTree
    let found = false
    const [path_found, params, handler] =  prefixTree.contains(pathSpited, requestMethod)
    found = path_found
    if ( !found ) {
      throw 'no such path'
    }
    console.log(params);
    console.log(handler);
    ret = {'path':request_path, 'handler':handler, 'method': requestMethod,'params':params};

    return ret
  }
}

export default (routers) => {
  const ret = new Router(routers);
  
  return ret;
}