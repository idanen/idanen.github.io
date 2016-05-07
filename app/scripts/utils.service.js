/**
 * Created by idanen on 21/12/2015.
 */
(function () {
  'use strict';

  angular
    .module('pokerManager.services')
    .provider('Utils', UtilsProvider);

  UtilsProvider.$inject = ['$windowProvider'];
  function UtilsProvider($windowProvider) {
    var provider = this;

    provider.service = new UtilService($windowProvider.$get());
    provider.getToken = provider.service.getToken;

    provider.$get = function () {
      return provider.service;
    };
  }

  function UtilService($window) {
    this.localStorage = $window.localStorage;
  }

  UtilService.prototype = {
    totalsCalc: function (anArray, fieldNameToSum) {
      var sum = 0,
          i;
      if (!anArray) {
        return 0;
      }

      for (i = 0; i < anArray.length; ++i) {
        sum += parseInt(anArray[i][fieldNameToSum], 10);
      }
      return sum;
    },
    avgsCalc: function (anArray, fieldNameToSum) {
      var sum = 0,
          i;
      if (!anArray) {
        return 0;
      }

      for (i = 0; i < anArray.length; ++i) {
        sum += parseInt(anArray[i][fieldNameToSum], 10);
      }
      return sum / anArray.length;
    },
    maxCalc: function (anArray, fieldNameToSum) {
      var max = 0,
          i;
      if (!anArray) {
        return 0;
      }

      for (i = 0; i < anArray.length; ++i) {
        max = Math.max(anArray[i][fieldNameToSum], max);
      }
      return max;
    },
    saveLocal: function (key, content) {
      if (angular.isObject(content)) {
        this.localStorage.setItem(key, JSON.stringify(content));
      }
    },
    loadLocal: function (key) {
      return JSON.parse(this.localStorage.getItem(key));
    },
    saveToken: function (toSave) {
      this.localStorage.setItem('token', toSave);
    },
    getToken: function () {
      return this.localStorage.getItem('token');
    },
    clearToken: function () {
      this.localStorage.removeItem('token');
    }
  };
}());
