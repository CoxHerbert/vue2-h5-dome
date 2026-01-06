import perm from './perm';
import antiClick from './anti-click';
import permission from './permission';

export function setupDirectives(app) {
  app.directive('perm', perm);
  app.directive('anti-click', antiClick);
  app.directive('permission', permission);
}
