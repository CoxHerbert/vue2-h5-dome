export function toFormData(obj = {}) {
  const fd = new FormData();
  Object.entries(obj).forEach(([k, v]) => {
    if (Array.isArray(v)) v.forEach(i => fd.append(k, i));
    else if (v !== undefined && v !== null) fd.append(k, v);
  });
  return fd;
}
