import makeRouter from './src/router.js';


const routes = [
    {
      // Роутер используется как часть на конкретном сайте, поэтому роутеру нужно знать лишь про сами маршруты на сайте
      // не учитываем протокол, хост и т. д.
      path: '/courses', // маршрут
      handler: () => 'courses!', // обработчик
    },
    {
      path: '/courses/basics',
      handler: () => 'basics',
    },
  ];
  const router = makeRouter(routes);
  
  const path = '/courses';
  const handler = router.serve(path);
  console.log(handler);
  console.log(handler()); // courses!
  
  // здесь выбросится исключение
  console.log(router.serve('/no_such_way'));

