/* global firebase:false */
/* eslint no-undef:0, no-warning-comments:0, spaced-comment:0 */
(function (sw) {
  'use strict';

  //var API_ENDPOINT = 'https://fiery-heat-6939.firebaseio.com';
  firebase.initializeApp({
    apiKey: 'AIzaSyDMrP9xSV8woT6-lt-TBiyMkSy0r3EiHAs',
    databaseURL: 'https://fiery-heat-6939.firebaseio.com',
    messagingSenderId: '101062618190'
    // apiKey: 'AIzaSyBSOxr6ZfxJRPX3dBqq-staeFMLkiO10BA',
    // databaseURL: 'https://pokermunity.firebaseio.com',
    // messagingSenderId: '734384281646'
  });

  const messaging = firebase.messaging();

  messaging.setBackgroundMessageHandler(payload => {
    console.log('Received push with firebase messaging: ', payload);

    sw.registration.showNotification(payload.title, {
      body: payload.body,
      icon: '/img/android-icon-192x192.png',
      tag: 'push-notification-test'
    });
  });

  // sw.addEventListener('activate', function (event) {
  //   console.log('notifications activated', event);
  //   // TODO: get the current user maybe from localStorage and his registered communities
  //   //event.waitUntil(
  //   //  fetch(API_ENDPOINT + '/notifications')
  //   //    .then(function (response) {
  //   //      return response.json();
  //   //    })
  //   //    .then(function (communities) {
  //   //
  //   //    })
  //   //);
  // });
  //
  // sw.addEventListener('push', function (event) {
  //   console.log('Got push :)');
  //   // TODO: get last notifications, filter for current user's communities, get data for the notification and present it
  //   //event.waitUntil(
  //   //  fetch(API_ENDPOINT + '/notifications')
  //   //    .then(function (response) {
  //   //      return response.json();
  //   //    })
  //   //    .then(function (communities) {
  //   //
  //   //    })
  //   //);
  //   event.waitUntil(
  //     sw.registration.showNotification('Hello', {
  //       body: 'This is the notification\'s body',
  //       icon: '/img/android-icon-192x192.png',
  //       tag: 'push-notification-test'
  //     })
  //   );
  // });
  //
  // sw.addEventListener('notificationclick', function (event) {
  //   event.notification.close();
  //
  //   event.waitUntil(
  //     sw.clients.matchAll({
  //       includeUncontrolled: true,
  //       type: 'window'
  //     })
  //       .then(function (clientList) {
  //         for (let i = 0, length = clientList.length; i < length; i++) {
  //           let client = clientList[i];
  //           if ('focus' in client) {
  //             return client.focus();
  //           }
  //         }
  //         if (sw.clients.openWindow) {
  //           return sw.clients.openWindow('/');
  //         }
  //       })
  //   );
  // });
}(self));
