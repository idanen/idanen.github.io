(function () {
  'use strict';

  class PushStateBtnController {
    static get $inject() {
      return ['$element', 'pushState', 'userService', '$scope'];
    }

    constructor($element, pushState, userService, $scope) {
      this.$element = $element;
      this.pushState = pushState;
      this.userService = userService;
      this.$scope = $scope;

      this.eventListeners = {
        'iron-change': evt => this.toggleChanged(evt)
      };
    }

    $postLink() {
      this.toggler = this.$element.find('paper-toggle-button')[0];
      this.pushState.getInitialState()
        .then(this.updateSubscription.bind(this))
        .then(this._attachEventListeners.bind(this));
    }

    $onDestroy() {
      this._detachEventListeners();
    }

    updateSubscription(subscription) {
      if (!this.pushState.isNotificationSupported()) {
        this.toggler.setAttribute('disabled', '');
        this.toggler.disabled = true;
        return;
      }

      this.toggler.removeAttribute('disabled');

      if (subscription) {
        return this.userService.waitForUser()
          .then(() => this.userService.checkSubscriptionId(subscription))
          .then(exists => this._subscriptionToggleUpdate(subscription, exists));
      }

      this.toggler.checked = false;

      this.$scope.$applyAsync(() => {
        this.permissionChange(!!subscription);
      });
      return false;
    }

    toggleChanged(event) {
      if (event.target.checked) {
        this.pushState.subscribe()
          .then(this.saveSubscriptionEndpoint.bind(this))
          .catch(error => {
            this.toggler.dataset.pushEnabled = undefined;
            this.toggler.classList.remove('active');
            this.$scope.$emit('pushState.subscription.error', error);
          });
      } else {
        this.pushState.unsubscribe()
          .then(this.deleteSubscriptionEndpoint.bind(this));
      }
    }

    saveSubscriptionEndpoint(endpoint) {
      this.toggler.dataset.pushEnabled = true;
      this.toggler.classList.add('active');
      this.$scope.$emit('pushState.subscription.successful', endpoint);
      this.userService.addSubscriptionId(endpoint);
    }

    deleteSubscriptionEndpoint(subscriptionEndpoint) {
      this.toggler.dataset.pushEnabled = false;
      this.toggler.classList.remove('active');
      this.userService.removeSubscriptionId(subscriptionEndpoint);
    }

    _subscriptionToggleUpdate(subscription, savedToServer = false) {
      this.toggler.checked = savedToServer;
      this.$scope.$emit('pushState.subscription.successful', subscription);
      if (!savedToServer) {
        console.warn('user subscribed but server had no subscription record');
        this.pushState.unsubscribe();
        return false;
      }

      return subscription;
    }

    _attachEventListeners() {
      Object.keys(this.eventListeners).forEach(eventName => {
        this.toggler.addEventListener(eventName, this.eventListeners[eventName]);
      });
    }

    _detachEventListeners() {
      Object.keys(this.eventListeners).forEach(eventName => {
        this.toggler.removeEventListener(eventName, this.eventListeners[eventName]);
      });
    }
  }

  angular
    .module('pokerManager')
    .component('pushStateBtn', {
      controller: PushStateBtnController,
      template: '<paper-toggle-button class="push-state-btn" disabled>{{$ctrl.label}}</paper-toggle-button>',
      bindings: {
        label: '@',
        permissionChange: '&'
      }
    });
}());
