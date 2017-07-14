window.mockFirebase = (function (global) {
  const originalFirebase = global.firebase;
  const noOp = () => {};
  const firebaseStorageListeners = {
    complete: [],
    error: [],
    change: []
  };

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
  const firebaseStorageChildFn = () => ({
    put: () => ({
      on: (event, changeFn, errorFn, completeFn) => {
        firebaseStorageListeners.change.push(changeFn);
        firebaseStorageListeners.error.push(errorFn);
        firebaseStorageListeners.complete.push(completeFn);
      },
      then: completeFn => completeFn({downloadURL: 'uploaded-image.jpg'})
    }),
    child: firebaseStorageChildFn
  });

  function triggerStorageListeners(type, data) {
    firebaseStorageListeners[type].forEach(listener => listener(data));
  }

  return {
    override,
    restore,
    triggerStorageListeners
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
      storage: () => ({
        ref: () => ({
          child: firebaseStorageChildFn
        }),
        put: () => ({
          on: (event, changeFn, errorFn, completeFn) => {
            firebaseStorageListeners.change.push(changeFn);
            firebaseStorageListeners.error.push(errorFn);
            firebaseStorageListeners.complete.push(completeFn);
          },
          then: completeFn => completeFn({downloadURL: 'uploaded-image.jpg'})
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
