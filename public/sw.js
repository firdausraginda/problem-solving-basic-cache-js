var CACHE_STATIC_NAME = 'static-v2';
var CACHE_DYNAMIC_NAME = 'dynamic-v1';
var STATIC_FILES = [
  '/',
  '/index.html',
  '/src/css/app.css',
  '/src/css/main.css',
  '/src/js/main.js',
  '/src/js/material.min.js',
  'https://fonts.googleapis.com/css?family=Roboto:400,700',
  'https://fonts.googleapis.com/icon?family=Material+Icons',
  'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css'
]

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_STATIC_NAME)
      .then(function (cache) {
        cache.addAll(STATIC_FILES);
      })
  )
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys()
      .then(function (keyList) {
        return Promise.all(keyList.map(function (key) {
          if (key !== CACHE_STATIC_NAME) {
            return caches.delete(key);
          }
        }));
      })
  );
});

function isInArray(string, array){
  for (var i=0; i<array.length; i++){
    if(array[i] == string) {
      return true
    }
  }
  return false
}

// CACHE THEN NETWORK DYNAMIC CACHING + CACHE WITH NETWORK FALLBACK + CACHE ONLY
self.addEventListener('fetch', function (event) {
  if (event.request.url.indexOf('https://httpbin.org/ip') > -1) {
    // CACHE THEN NETWORK DYNAMIC CACHING
    // khusus utk data di dalam url httpbin.org/ip langsung di store di cache, gausah di cari dulu ada apa ga
    event.respondWith(
      caches.open(CACHE_DYNAMIC_NAME)
        .then(function (cache) {
          return fetch(event.request)
            .then(function (res) {
              cache.put(event.request.url, res.clone())
              return res
            })
        })
    )
  } else if (isInArray(event.request.url, STATIC_FILES)) {
    // CACHE ONLY
    event.respondWith(
      caches.match(event.request)
    )
  } else {
    // CACHE WITH NETWORK FALLBACK
    // utk data dari url lain, di cari dulu di cache, kalo gaketemu baru ke network
    event.respondWith(
      caches.match(event.request)
        .then(function (response) {
          if (response) {
            return response;
          } else {
            return fetch(event.request)
              .then(function (res) {
                return caches.open(CACHE_DYNAMIC_NAME)
                  .then(function (cache) {
                    cache.put(event.request.url, res.clone());
                    return res;
                  });
              })
              .catch(function (err) {

              });
          }
        }))
  }
})

// CACHE THEN NETWORK DYNAMIC CACHING
// self.addEventListener('fetch', function (event) {
//   event.respondWith(
//     caches.open(CACHE_DYNAMIC_NAME)
//       .then(function (cache) {
//         return fetch(event.request)
//           .then(function (res) {
//             cache.put(event.request.url, res.clone())
//             return res
//           })
//       })
//   )
// })

// NETWORK, CACHE FALLBACK
// self.addEventListener('fetch', function (event) {
//   event.respondWith(
//     fetch(event.request)
//       // dynamic caching
//       .then(function (res) {
//         return caches.open(CACHE_DYNAMIC_NAME)
//           .then(function (cache) {
//             cache.put(event.request.url, res.clone())
//             return res
//           })
//       })
//       .catch(function (err) {
//         return caches.match(event.request)
//       })
//   )
// })

// NETWORK-ONLY
// self.addEventListener('fetch', function (event) {
//   event.respondWith(
//     fetch(event.request)
//   );
// });

// CACHE-ONLY
// self.addEventListener('fetch', function (event) {
//   event.respondWith(
//     caches.match(event.request)
//   )
// })

// CACHES, NETWORK FALLBACK
// self.addEventListener('fetch', function(event) {
//   event.respondWith(
//     caches.match(event.request)
//       .then(function(response) {
//         if (response) {
//           return response;
//         } else {
//           return fetch(event.request)
//             .then(function(res) {
//               return caches.open(CACHE_DYNAMIC_NAME)
//                 .then(function(cache) {
//                   cache.put(event.request.url, res.clone());
//                   return res;
//                 });
//             })
//             .catch(function(err) {

//             });
//         }
//       })
//   );
// });