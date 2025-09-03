import perm from './perm';
import antiClick from './anti-click';

export function setupDirectives(app) {
  app.directive('perm', perm);
  app.directive('anti-click', antiClick);
}
