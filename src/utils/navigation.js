export function goBackOrHome(router, fallback = '/home') {
  if (!router) {
    console.warn('[goBackOrHome] router instance is required');
    return;
  }

  const historyState = window.history.state;
  const canGoBack =
    (historyState && historyState.back !== null && historyState.back !== undefined) ||
    window.history.length > 1;

  if (fallback) {
    router.replace(fallback);
  } else {
    router.back();
  }
}
