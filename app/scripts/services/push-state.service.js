(function () {
  'use strict';

  angular
    .module('pushState', [])
    .service('pushState', PushState);
    // .run(init);

  PushState.$inject = ['$q', '$window'];
  function PushState($q, $window) {
    this.subscription = false;
    this.notificationPermited = false;
    this.notificationDenied = false;
    this.workerReadyPromise = ('serviceWorker' in $window.navigator) ? $q.resolve($window.navigator.serviceWorker.ready) : $q.reject('ServiceWorker is not supported');
    this.$q = $q;
    this.$window = $window;
  }

  PushState.prototype = {
    // Once the service worker is registered set the initial state
    getInitialState: function () {
      // If we have a subscription than `getInitialState` has already been called
      if (this.subscription) {
        return this.$q.resolve(this.subscription);
      }

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
        .then(this._updateSubscription.bind(this))
        .then(this._requestNotificationsPermissions.bind(this))
        .then(this._updateNotificationsPermission.bind(this))
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
      return this.workerReadyPromise.then(function (registration) {
        return registration.pushManager.getSubscription();
      })
        .then(function (subscription) {
          var subscriptionEndpoint = this._extractGCMRegistrationId(subscription);
          return subscription.unsubscribe()
            .then(function () {
              this.subscription = false;
              this.notificationPermited = false;
              this.notificationDenied = false;
              return subscriptionEndpoint;
            }.bind(this));
        }.bind(this))
        .catch(function (err) {
          console.warn('Error during getSubscription()', err);
          return this.$q.reject(err);
        }.bind(this));
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

        return endpoint;
      }
    },
    isEnabled: function () {
      return !!this.subscription;
    },
    _requestNotificationsPermissions: function () {
      return this.$window.Notification.requestPermission(angular.noop);
    },
    _updateNotificationsPermission: function () {
      this.notificationPermited = (this.$window.Notification.permission === 'granted');

      return this.subscription;
    },
    /**
     * Update the subscription property, but only if the value has changed.
     * This prevents triggering the subscription-changed event twice on page
     * load.
     * @param {PushSubscription} subscription The new subscription object
     * @return {PushSubscription} The save subscription, `false` if not subscribed
     */
    _updateSubscription: function (subscription) {
      if (JSON.stringify(subscription) !== JSON.stringify(this.subscription)) {
        this.subscription = subscription;
      }
      return this.subscription;
    }
  };

  // init.$inject = ['$window', 'pushState'];
  // function init($window, pushState) {
  //   $window.navigator.serviceWorker.ready
  //     .then(function () {
  //       pushState.getInitialState();
  //     });
  // }
}());
