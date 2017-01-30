(function () {
  'use strict';

  angular
    .module('pushState', [])
    .service('pushState', PushState);

  PushState.$inject = ['$q', '$window', 'polymerToaster'];
  function PushState($q, $window, polymerToaster) {
    this.subscription = false;
    this.workerReadyPromise = ('serviceWorker' in $window.navigator) ? $q.resolve($window.navigator.serviceWorker.ready) : $q.reject('ServiceWorker is not supported');
    this.$q = $q;
    this.$window = $window;
    this.polymerToaster = polymerToaster;

    this.ready = this.workerReadyPromise
      .then(registration => {
        this.firebaseMessaging = this.$window.firebase.messaging();
        this.firebaseMessaging.useServiceWorker(registration);

        return this.firebaseMessaging.getToken();
      })
      .then(this._updateSubscription.bind(this))
      .then(() => {
        this.firebaseMessaging.onMessage(this.notificationReceived.bind(this));
      });
  }

  PushState.prototype = {
    isNotificationSupported: function () {
      return (('PushManager' in this.$window) && this.$window.ServiceWorkerRegistration && ('showNotification' in this.$window.ServiceWorkerRegistration.prototype));
    },

    notificationReceived: function (payload) {
      console.log('Message received: ', payload);
      this.polymerToaster.notificationToast(`${payload.notification.title}: ${payload.notification.body}`);
    },

    // Once the service worker is registered set the initial state
    getInitialState: function () {
      // Check if push messaging is supported
      if (!this.isNotificationSupported()) {
        console.warn('Push messaging isn\'t supported.');
        return this.$q.reject(new Error('Push messaging isn\'t supported.'));
      }

      return this.ready
        .then(() => this.firebaseMessaging.getToken())
        .then(this._updateSubscription.bind(this));
    },
    subscribe: function () {
      if (!this.isNotificationSupported()) {
        console.warn('Push messaging isn\'t supported.');
        return this.$q.reject(new Error('Push messaging isn\'t supported.'));
      }

      return this.ready
        .then(() => this.firebaseMessaging.requestPermission())
        .then(() => {
          return this.getInitialState();
        })
        .catch(err => {
          return this.$q.reject(err);
        });
    },
    unsubscribe: function () {
      return this.ready
        .then(() => this.firebaseMessaging.getToken())
        .then(currentToken => {
          this.subscription = currentToken;
          return this.firebaseMessaging.deleteToken(currentToken);
        })
        .then(() => {
          const deletedToken = this.subscription;
          this.subscription = undefined;
          return deletedToken;
        });
    },
    /**
     * Update the subscription property, but only if the value has changed.
     * This prevents triggering the subscription-changed event twice on page
     * load.
     * @param {string} subscription The new subscription object
     * @return {string} The save subscription, `false` if not subscribed
     */
    _updateSubscription: function (subscription) {
      if (subscription !== this.subscription) {
        this.subscription = subscription;
      }
      return this.subscription;
    }
  };
}());
