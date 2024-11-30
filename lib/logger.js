export const logger = {
   level: 'silent',
   log() {},
   info() {},
   warn() {},
   error() {},
   trace() {},
   debug() {},
   child() {
      return this;
   },
};
