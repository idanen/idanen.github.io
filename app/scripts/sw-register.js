/* !
 *
 *  Web Starter Kit
 *  Copyright 2015 Google Inc. All rights reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *    https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License
 *
 */
/* eslint-env browser */
/* eslint "angular/ng_window_service":0, "angular/ng_typecheck_function":0, "angular/ng_document_service":0 */
(function (window, navigator) {
  'use strict';

  // Check to make sure service workers are supported in the current browser,
  // and that the current page is accessed from a secure origin. Using a
  // service worker from an insecure origin will trigger JS console errors. See
  // http://www.chromium.org/Home/chromium-security/prefer-secure-origins-for-powerful-new-features
  var isLocalhost = Boolean(window.location.hostname === 'localhost' ||
      // [::1] is the IPv6 localhost address.
    window.location.hostname === '[::1]' ||
      // 127.0.0.1/8 is considered localhost for IPv4.
    window.location.hostname.match(
      /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
    )
  );

  if ('serviceWorker' in navigator &&
    (window.location.protocol === 'https:' || isLocalhost)) {
    navigator.serviceWorker.register('service-worker.js')
      .then(function (registration) {
        var installingWorker;
        // Check to see if there's an updated version of service-worker.js with
        // new files to cache:
        // https://slightlyoff.github.io/ServiceWorker/spec/service_worker/index.html#service-worker-registration-update-method
        if (typeof registration.update === 'function') {
          registration.update();
        }

        // updatefound is fired if service-worker.js changes.
        registration.onupdatefound = function () {
          // updatefound is also fired the very first time the SW is installed,
          // and there's no need to prompt for a reload at that point.
          // So check here to see if the page is already controlled,
          // i.e. whether there's an existing service worker.
          if (navigator.serviceWorker.controller) {
            // The updatefound event implies that registration.installing is set:
            // https://slightlyoff.github.io/ServiceWorker/spec/service_worker/index.html#service-worker-container-updatefound-event
            installingWorker = registration.installing;

            installingWorker.onstatechange = function () {
              switch (installingWorker.state) {
                case 'installed':
                  // At this point, the old content will have been purged and the
                  // fresh content will have been added to the cache.
                  // It's the perfect time to display a "New content is
                  // available; please refresh." message in the page's interface.
                  break;

                case 'redundant':
                  throw new Error('The installing ' +
                    'service worker became redundant.');

                default:
                // Ignore
              }
            };
          }
        };
      }).then(initialiseState).catch(function (e) {
        console.error('Error during service worker registration:', e);
      });
  }

  // Once the service worker is registered set the initial state
  function initialiseState() {
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

    // We need the service worker registration to check for a subscription
    navigator.serviceWorker.ready.then(function (serviceWorkerRegistration) {
      // Do we already have a push message subscription?
      serviceWorkerRegistration.pushManager.getSubscription()
        .then(function (subscription) {
          // Enable any UI which subscribes / unsubscribes from
          // push messages.
          var pushButton = document.querySelector('.js-push-button');
          pushButton.removeAttribute('disabled');

          if (!subscription) {
            // We aren't subscribed to push, so set UI
            // to allow the user to enable push
            pushButton.checked = false;

            pushButton.addEventListener('iron-change', function (evt) {
              if (evt.target.checked) {
                subscribe();
              } else {
                unsubscribe();
              }
            });
            return;
          }

          // Keep your server in sync with the latest subscriptionId
          sendSubscriptionToServer(subscription);

          // Set your UI to show they have subscribed for
          // push messages
          pushButton.checked = true;
        })
        .catch(function (err) {
          console.warn('Error during getSubscription()', err);
        });
    });
  }

  function sendSubscriptionToServer(subscription) {
    if (subscription && subscription.endpoint) {
      console.log('sending subscription to server', extractGCMRegistrationId(subscription));
    } else {
      console.error('subscription does not contain an endpoint', subscription);
    }
  }

  function subscribe() {
    // Disable the button so it can't be changed while
    // we process the permission request
    var pushButton = document.querySelector('.js-push-button');
    pushButton.setAttribute('disabled', 'disabled');

    navigator.serviceWorker.ready.then(function (serviceWorkerRegistration) {
      serviceWorkerRegistration.pushManager.subscribe({
        userVisibleOnly: true
      })
        .then(function (subscription) {
          // The subscription was successful
          pushButton.checked = true;
          pushButton.removeAttribute('disabled');

          // TODO: Send the subscription.endpoint to your server
          // and save it to send a push message at a later date
          return sendSubscriptionToServer(subscription);
        })
        .catch(function (e) {
          if (Notification.permission === 'denied') {
            // The user denied the notification permission which
            // means we failed to subscribe and the user will need
            // to manually change the notification permission to
            // subscribe to push messages
            console.warn('Permission for Notifications was denied');
            pushButton.setAttribute('disabled', 'disabled');
          } else {
            // A problem occurred with the subscription; common reasons
            // include network errors, and lacking gcm_sender_id and/or
            // gcm_user_visible_only in the manifest.
            console.error('Unable to subscribe to push.', e);
            pushButton.setAttribute('disabled', 'disabled');
            pushButton.checked = false;
          }
        });
    });
  }

  function unsubscribe() {

  }

  function extractGCMRegistrationId(endpoint) {
    if (endpoint.indexOf('https://android.googleapis.com/gcm/send') > -1) {
      let endpointParts = endpoint.split('/');

      return endpointParts[endpointParts.length - 1];
    }
  }
}(window, window.navigator));
