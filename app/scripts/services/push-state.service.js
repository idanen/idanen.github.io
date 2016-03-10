(function () {
  'use strict';

  angular
    .module('pushState', [])
    .service('pushState', PushState)
    .run(init);

  PushState.$inject = ['$window'];
  function PushState($window) {
    this.subscriptionId = false;
    this.notificationPermited = false;
    this.notificationDenied = false;
    this.$window = $window;
  }

  PushState.prototype = {
    // Once the service worker is registered set the initial state
    getInitialState: function () {
      // Are Notifications supported in the service worker?
      if (!('showNotification' in ServiceWorkerRegistration.prototype)) {
        console.warn('Notifications aren\'t supported.');
        return;
      }

      // Check the current Notification permission.
      // If its denied, it's a permanent block until the
      // user changes the permission
      if (Notification.permission === 'denied') {
        console.warn('The user has blocked notifications.');
        return;
      }

      // Check if push messaging is supported
      if (!('PushManager' in window)) {
        console.warn('Push messaging isn\'t supported.');
        return;
      }

      // Do we already have a push message subscription?
      return PushState.serviceWorkerRegistration.pushManager.getSubscription()
        .then(function (subscription) {
          this.subscriptionId = subscription;
          return this.subscriptionId;
        }.bind(this))
        .catch(function (err) {
          console.warn('Error during getSubscription()', err);
          return Promise.reject(err);
        });
    },
    subscribe: function () {
      PushState.serviceWorkerRegistration.pushManager.subscribe({
        userVisibleOnly: true
      })
        .then(function (subscription) {
          // The subscription was successful
          this.subscriptionId = subscription;
          return this.subscriptionId;
        }.bind(this))
        .then(this.$window.Notification.requestPermission)
        .then(function () {
          if (Notification.permission === 'granted') {
            this.notificationPermited = true;
          }

          return this.subscriptionId;
        }.bind(this))
        .catch(function (e) {
          if (this.$window.Notification.permission === 'denied') {
            // The user denied the notification permission which
            // means we failed to subscribe and the user will need
            // to manually change the notification permission to
            // subscribe to push messages
            console.warn('Permission for Notifications was denied');
            this.notificationPermited = false;
            this.notificationDenied = true;
          } else {
            // A problem occurred with the subscription; common reasons
            // include network errors, and lacking gcm_sender_id and/or
            // gcm_user_visible_only in the manifest.
            console.error('Unable to subscribe to push.', e);
            this.notificationPermited = false;
          }
        }.bind(this));
    }
  };

  init.$inject = ['$window'];
  function init($window) {
    $window.navigator.serviceWorker.ready
      .then(function (registration) {
        PushState.serviceWorkerRegistration = registration;
      });
  }
}());
