(function () {
  'use strict';

  describe('pkCounter component', () => {
    const $element = document.createElement('div');
    let $componentController;

    beforeEach(module('pokerManager'));
    beforeEach(inject(_$componentController_ => {
      $componentController = _$componentController_;
    }));

    it('should initialize with given count', () => {
      const initCount = 12;
      const ctrl = $componentController('pkCounter', {$element}, {counter: initCount});

      expect(ctrl.counter).toEqual(initCount);
    });

    it('should support not providing `onUpdate` listener', () => {
      const initial = 31;
      const ctrl = $componentController('pkCounter', {$element}, {counter: initial});

      expect(ctrl.increment.bind(ctrl)).not.toThrow();
    });

    it('should increment', () => {
      const initial = 31;
      const ctrl = $componentController('pkCounter', {$element}, {counter: initial, onUpdate: angular.noop});

      ctrl.increment();

      expect(ctrl.counter).toEqual(initial + 1);
    });

    it('should decrement', () => {
      const initial = 31;
      const ctrl = $componentController('pkCounter', {$element}, {counter: initial, onUpdate: angular.noop});

      ctrl.decrement();

      expect(ctrl.counter).toEqual(initial - 1);
    });

    it('should call update listener on increment', () => {
      const initial = 5;
      const onUpdateSpy = jasmine.createSpy('onUpdate');
      const ctrl = $componentController('pkCounter', {$element}, {counter: initial, onUpdate: onUpdateSpy});

      ctrl.increment();

      expect(onUpdateSpy).toHaveBeenCalledWith({counter: initial + 1});
    });

    it('should call update listener on decrement', () => {
      const initial = 2;
      const onUpdateSpy = jasmine.createSpy('onUpdate');
      const ctrl = $componentController('pkCounter', {$element}, {counter: initial, onUpdate: onUpdateSpy});

      ctrl.decrement();

      expect(onUpdateSpy).toHaveBeenCalledWith({counter: initial - 1});
    });

    it('should not decrement below 0', () => {
      const initial = 0;
      const ctrl = $componentController('pkCounter', {$element}, {counter: initial});

      ctrl.decrement();

      expect(ctrl.counter).toEqual(initial);
    });

    it('should not call listener if decreasing below 0', () => {
      const initial = 0;
      const onUpdateSpy = jasmine.createSpy('onUpdate');
      const ctrl = $componentController('pkCounter', {$element}, {counter: initial, onUpdate: onUpdateSpy});

      ctrl.decrement();

      expect(onUpdateSpy).not.toHaveBeenCalled();
    });
  });
}());