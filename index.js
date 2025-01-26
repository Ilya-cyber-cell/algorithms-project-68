import makeRouter from './src/router.js';


const routes = [
  {
    path: '/courses/:id',
    handler: () => 'course!',
  },
  {
    path: '/courses/:course_id/exercises/:id',
    handler: () => 'exercise!',
  },
  {
    path: '/courses/11111/exercises/2222',
    handler: () => 'exercise!',
  },
  {
    path: '/courses/11111/exercises/:id',
    handler: () => 'exercise!',
  },    
];

  const router = makeRouter(routes);
  
//  const path = '/courses/php_trees';
  const path = '/courses/11111/exercises/3333';
  const handler = router.serve(path);
  console.log(handler);
//  console.log(handler()); // courses!
  
  // здесь выбросится исключение
//  console.log(router.serve('/no_such_way'));

