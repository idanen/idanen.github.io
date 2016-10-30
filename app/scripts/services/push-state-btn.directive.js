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

      this.eventListeners = {};
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
      var subscriptionEndpoint;
      if (!this.pushState.notificationDenied) {
        this.toggler.removeAttribute('disabled');
      }

      if (subscription && this.pushState.notificationPermited) {
        subscriptionEndpoint = this.pushState.getSubscriptionEndpoint();
        this.$scope.$emit('pushState.subscription.successful', subscriptionEndpoint);
        this.toggler.checked = true;
      } else {
        this.toggler.checked = false;
      }

      this.$scope.$applyAsync(() => {
        this.permissionChange(this.pushState.notificationPermited);
      });
    }

    toggleChanged(event) {
      if (event.target.checked) {
        this.pushState.subscribe()
          .then(() => this.pushState.getSubscriptionEndpoint())
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

    _attachEventListeners() {
      this.eventListeners['iron-change'] = evt => this.toggleChanged(evt);
      this.toggler.addEventListener('iron-change', this.eventListeners['iron-change']);
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
