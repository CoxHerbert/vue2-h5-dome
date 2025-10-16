import { onBeforeUnmount, onMounted, ref } from 'vue';

const hasWindow = typeof window !== 'undefined';

const defaultRequestFrame = hasWindow && typeof window.requestAnimationFrame === 'function'
  ? window.requestAnimationFrame.bind(window)
  : (cb) => setTimeout(cb, 16);

const defaultCancelFrame = hasWindow && typeof window.cancelAnimationFrame === 'function'
  ? window.cancelAnimationFrame.bind(window)
  : (id) => clearTimeout(id);

const getDocumentScrollTop = () => {
  if (!hasWindow) return 0;

  return (
    window.pageYOffset ||
    document.documentElement.scrollTop ||
    document.body.scrollTop ||
    0
  );
};

const resolveTarget = (target) => {
  if (typeof target === 'function') {
    return target();
  }

  if (target) {
    return target;
  }

  return hasWindow ? window : undefined;
};

const getScrollTop = (el) => {
  if (!el) return 0;

  if (el === window) {
    return getDocumentScrollTop();
  }

  return el.scrollTop;
};

export function useScrollHide(options = {}) {
  const { threshold = 8, target } = options;
  const isHidden = ref(false);

  let lastScrollTop = 0;
  let rafId = null;
  let resolvedTarget;

  const updateVisibility = () => {
    if (!resolvedTarget) return;

    const currentScrollTop = getScrollTop(resolvedTarget);
    const delta = currentScrollTop - lastScrollTop;

    if (currentScrollTop <= 0) {
      isHidden.value = false;
    } else if (Math.abs(delta) > threshold) {
      isHidden.value = delta > 0;
    }

    lastScrollTop = currentScrollTop;
  };

  const onScroll = () => {
    if (rafId !== null) return;

    rafId = defaultRequestFrame(() => {
      updateVisibility();
      rafId = null;
    });
  };

  const cleanup = () => {
    if (resolvedTarget) {
      resolvedTarget.removeEventListener('scroll', onScroll);
      resolvedTarget = undefined;
    }

    if (rafId !== null) {
      defaultCancelFrame(rafId);
      rafId = null;
    }
  };

  onMounted(() => {
    resolvedTarget = resolveTarget(target);
    if (!resolvedTarget) return;

    lastScrollTop = getScrollTop(resolvedTarget);
    resolvedTarget.addEventListener('scroll', onScroll, { passive: true });
  });

  onBeforeUnmount(() => {
    cleanup();
  });

  return {
    isHidden,
    refreshTarget() {
      cleanup();
      resolvedTarget = resolveTarget(target);
      if (!resolvedTarget) return;

      lastScrollTop = getScrollTop(resolvedTarget);
      resolvedTarget.addEventListener('scroll', onScroll, { passive: true });
    },
  };
}
