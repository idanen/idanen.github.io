(function () {
  'use strict';

  angular
    .module('pokerManager')
    .directive('pushStateBtn', pushStateBtnFactory);

  pushStateBtnFactory.$inject = ['pushState', 'userService'];
  function pushStateBtnFactory(pushState, userService) {
    return {
      restrict: 'E',
      template: '<paper-toggle-button class="push-state-btn" disabled>Allow push notifications</paper-toggle-button>',
      link: linkFn
    };

    function linkFn($scope, $element) {
      var toggler = $element.find('paper-toggle-button'),
          subscriptionEndpoint;
      pushState.getInitialState()
        .then(function (subscription) {
          if (!pushState.notificationDenied) {
            toggler.removeAttr('disabled');
          }

          if (subscription && pushState.notificationPermited) {
            subscriptionEndpoint = pushState.getSubscriptionEndpoint();
            $scope.$emit('pushState.subscription.successful', subscriptionEndpoint);
            toggler[0].checked = true;
          } else {
            toggler[0].checked = false;
          }
        });

      toggler.on('iron-change', function (event) {
        if (event.target.checked) {
          pushState.subscribe()
            .then(pushState.getSubscriptionEndpoint.bind(pushState))
            .then(function (endpoint) {
              subscriptionEndpoint = endpoint;
              toggler[0].dataset.pushEnabled = true;
              toggler.addClass('active');
              $scope.$emit('pushState.subscription.successful', subscriptionEndpoint);
              userService.addSubscriptionId(subscriptionEndpoint);
            })
            .catch(function (error) {
              toggler[0].dataset.pushEnabled = undefined;
              toggler.removeClass('active');
              $scope.$emit('pushState.subscription.error', error);
            });
        } else {
          pushState.unsubscribe()
            .then(function (subscriptionEndpoint) {
              toggler[0].dataset.pushEnabled = false;
              toggler.removeClass('active');
              userService.removeSubscriptionId(subscriptionEndpoint);
            });
        }
      });

      $element.on('$destroy', function () {
        toggler.off('iron-change');
      });
    }
  }
}());
