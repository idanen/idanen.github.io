(function () {
  'use strict';

  angular
    .module('pushState', [])
    .service('pushState', PushState)
    .run(init);

  PushState.$inject = ['$q', '$window'];
  function PushState($q, $window) {
    this.subscription = false;
    this.notificationPermited = false;
    this.notificationDenied = false;
    this.workerReadyPromise = $q.when($window.navigator.serviceWorker.ready);
    this.$q = $q;
    this.$window = $window;
  }

  PushState.prototype = {
    // Once the service worker is registered set the initial state
    getInitialState: function () {
      // Are Notifications supported in the service worker?
      if (!('showNotification' in this.$window.ServiceWorkerRegistration.prototype)) {
        console.warn('Notifications aren\'t supported.');
        return Promise.reject('Notifications aren\'t supported.');
      }

      // Check the current Notification permission.
      // If its denied, it's a permanent block until the
      // user changes the permission
      if (this.$window.Notification.permission === 'denied') {
        console.warn('The user has blocked notifications.');
        this.notificationDenied = true;
        return Promise.reject('The user has blocked notifications.');
      }

      // Check if push messaging is supported
      if (!('PushManager' in this.$window)) {
        console.warn('Push messaging isn\'t supported.');
        return Promise.reject('Push messaging isn\'t supported.');
      }

      // Do we already have a push message subscription?
      return this.workerReadyPromise.then(function (registration) {
        return registration.pushManager.getSubscription();
      })
        .then(function (subscription) {
          this._updateSubscription(subscription);
          this.notificationPermited = this.$window.Notification.permission === 'granted';
          return this.subscription;
        }.bind(this))
        .catch(function (err) {
          console.warn('Error during getSubscription()', err);
          return this.$q.reject(err);
        }.bind(this));
    },
    subscribe: function () {
      if (this.notificationDenied) {
        return this.$q.reject('The user denied notifications');
      }
      return this.workerReadyPromise.then(function (registration) {
        return this.$q.when(registration.pushManager.subscribe({
          userVisibleOnly: true
        }));
      }.bind(this))
        .then(function (subscription) {
          // The subscription was successful
          this._updateSubscription(subscription);
          return this.subscription;
        }.bind(this))
        .then(function () {
          return this.$window.Notification.requestPermission(angular.noop);
        }.bind(this))
        .then(function () {
          if (this.$window.Notification.permission === 'granted') {
            this.notificationPermited = true;
          }

          return this.subscription;
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
    },
    unsubscribe: function () {
      this.subscription = false;
    },
    getSubscriptionEndpoint: function () {
      return this._extractGCMRegistrationId(this.subscription);
    },
    _extractGCMRegistrationId: function (subscription) {
      var endpoint, endpointParts;
      if (subscription.endpoint) {
        endpoint = subscription.endpoint;
        if (endpoint.indexOf('https://android.googleapis.com/gcm/send') > -1) {
          endpointParts = endpoint.split('/');
          return endpointParts[endpointParts.length - 1];
        }
      }
    },
    isEnabled: function () {
      return !!this.subscription;
    },
    /**
     * Update the subscription property, but only if the value has changed.
     * This prevents triggering the subscription-changed event twice on page
     * load.
     * @param {PushSubscription} subscription The new subscription object
     */
    _updateSubscription: function (subscription) {
      if (JSON.stringify(subscription) !== JSON.stringify(this.subscription)) {
        this.subscription = subscription;
      }
    }
  };

  init.$inject = ['$window', 'pushState'];
  function init($window, pushState) {
    $window.navigator.serviceWorker.ready
      .then(function () {
        pushState.getInitialState();
      });
  }
}());
