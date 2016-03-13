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
      var toggler = $element.find('paper-toggle-button');
      pushState.getInitialState()
        .then(function (subscription) {
          var subscriptionEndpoint;
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
            .then(function () {
              return pushState.getSubscriptionEndpoint();
            })
            .then(function (subscriptionEndpoint) {
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
          pushState.unsubscribe();
        }
      });

      $element.on('$destroy', function () {
        toggler.off('iron-change');
      });
    }
  }
}());
