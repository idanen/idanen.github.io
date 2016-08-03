/* eslint no-undef:0, no-warning-comments:0, spaced-comment:0 */
(function (sw) {
  'use strict';

  //var API_ENDPOINT = 'https://fiery-heat-6939.firebaseio.com';

  sw.addEventListener('activate', function (event) {
    console.log('notifications activated', event);
    // TODO: get the current user maybe from localStorage and his registered communities
    //event.waitUntil(
    //  fetch(API_ENDPOINT + '/notifications')
    //    .then(function (response) {
    //      return response.json();
    //    })
    //    .then(function (communities) {
    //
    //    })
    //);
  });

  sw.addEventListener('push', function (event) {
    console.log('Got push :)');
    // TODO: get last notifications, filter for current user's communities, get data for the notification and present it
    //event.waitUntil(
    //  fetch(API_ENDPOINT + '/notifications')
    //    .then(function (response) {
    //      return response.json();
    //    })
    //    .then(function (communities) {
    //
    //    })
    //);
    event.waitUntil(
      sw.registration.showNotification('Push success!!!', {
        body: 'This is the notification\'s body',
        //icon: '/img/android-icon-192x192.png',
        tag: 'push-notification-test'
      })
    );
  });

  sw.addEventListener('notificationclick', function (event) {
    event.notification.close();

    event.waitUntil(
      sw.clients.matchAll({
        type: 'window'
      })
        .then(function (clientList) {
          for (let i = 0, length = clientList.length; i < length; i++) {
            let client = clientList[i];
            if (client.url === '/' && 'focus' in client) {
              return client.focus();
            }
          }
          if (sw.clients.openWindow) {
            return sw.clients.openWindow('/');
          }
        })
    );
  });
}(self));
