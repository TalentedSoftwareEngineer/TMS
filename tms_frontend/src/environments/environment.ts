// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  base_uri: 'http://localhost:3000/api/v1',
  stream_uri: 'http://localhost:6379/stream',
  // base_uri: 'http://192.168.115.96:3000/api/v1',
  // stream_uri: 'http://192.168.115.96:6379/stream',
  // base_uri: 'http://208.76.96.11:3000/api/v1',
  // stream_uri: 'http://208.76.96.11:6379/stream'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
