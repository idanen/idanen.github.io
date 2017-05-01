window.mockFirebase = (function (global) {
  const originalFirebase = global.firebase;

  return {
    override,
    restore
  };

  function override() {
    global.firebase = {
      database: () => ({
        ref: () => ({
          push: object => Promise.resolve(Object.assign({ '.key': 'arbitraryKey'}, object)),
          set: object => Promise.resolve(object),
          child: () => ({
            on: () => Promise.resolve(),
            once: () => Promise.resolve()
          })
        })
      }),
      initializeApp: config => config,
      auth: {
        GoogleAuthProvider: () => ({
          addScope: () => {}
        })
      }
    };
  }

  function restore() {
    global.firebase = originalFirebase;
  }
}(window));

window.mockFirebase.override();
