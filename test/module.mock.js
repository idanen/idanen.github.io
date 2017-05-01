window.mockFirebase = (function (global) {
  const originalFirebase = global.firebase;
  const noOp = () => {};

  function firebaseAuthMock() {
    return {
      onAuthStateChanged: noOp
    };
  }
  firebaseAuthMock.GoogleAuthProvider = () => ({
    addScope: noOp
  });
  const firebaseChildFn = () => ({
    on: () => global.$q.resolve(),
    once: () => global.$q.resolve(),
    update: () => global.$q.resolve(),
    child: firebaseChildFn
  });

  return {
    override,
    restore
  };

  function override() {
    angular.module('global $q', []).run(function ($q) {
      global.$q = $q;
    });

    global.firebase = {
      database: () => ({
        ref: () => ({
          push: object => global.$q.resolve(Object.assign({ '.key': 'arbitraryKey'}, object)),
          set: object => global.$q.resolve(object),
          update: () => global.$q.resolve(),
          child: firebaseChildFn
        })
      }),
      initializeApp: config => config,
      auth: firebaseAuthMock
    };
  }

  function restore() {
    global.firebase = originalFirebase;
  }
}(window));

window.mockFirebase.override();
