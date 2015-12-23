/**
 * Created by idanen on 21/12/2015.
 */
(function () {
  'use strict';

  angular
    .module('pokerManager.services')
    .provider('Utils', UtilsProvider);

  function UtilsProvider() {
    var provider = this;

    provider.service = new UtilService();
    provider.getToken = provider.service.getToken;

    provider.$get = [function () {
      return provider.service;
    }];
  }

  function UtilService() {
  }

  UtilService.prototype = {
    totalsCalc: function (anArray, fieldNameToSum) {
      var sum = 0;
      for (var i = 0; i < anArray.length; ++i) {
        sum += parseInt(anArray[i][fieldNameToSum]);
      }
      return sum;
    },
    avgsCalc: function (anArray, fieldNameToSum) {
      var sum = 0;
      for (var i = 0; i < anArray.length; ++i) {
        sum += parseInt(anArray[i][fieldNameToSum]);
      }
      return ( sum / anArray.length );
    },
    maxCalc: function (anArray, fieldNameToSum) {
      var max = 0;
      for (var i = 0; i < anArray.length; ++i) {
        max = Math.max(anArray[i][fieldNameToSum], max);
      }
      return max;
    },
    saveLocal: function (key, content) {
      if (angular.isObject(content)) {
        localStorage.setItem(key, JSON.stringify(content));
      }
    },
    loadLocal: function (key) {
      return JSON.parse(localStorage.getItem(key));
    },
    saveToken: function (toSave) {
      localStorage.setItem('token', toSave);
    },
    getToken: function () {
      return localStorage.getItem('token');
    },
    clearToken: function () {
      localStorage.removeItem('token');
    }
  };
}());
