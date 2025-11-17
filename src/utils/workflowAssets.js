const baseUrl = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
const workflowImageBase = `${baseUrl}/images/workflow`;

export function getWorkflowImageBase() {
  return workflowImageBase;
}

export function resolveWorkflowAsset(path = '', base = workflowImageBase) {
  const effectiveBase = typeof base === 'string' && base ? base : workflowImageBase;
  const normalizedBase = effectiveBase.replace(/\/$/, '');
  const normalizedPath = String(path || '').replace(/^\/+/, '');
  return normalizedPath ? `${normalizedBase}/${normalizedPath}` : normalizedBase;
}

export default {
  getWorkflowImageBase,
  resolveWorkflowAsset,
};
