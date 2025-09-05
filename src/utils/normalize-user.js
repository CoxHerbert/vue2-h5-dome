// src/utils/normalize-user.js
// 把 "a,b,c" → ["a","b","c"]；空串/空值 → []
const csv = (s) =>
  s
    ? String(s)
        .split(',')
        .map((x) => x.trim())
        .filter(Boolean)
    : [];

export function normalizeUser(data = {}) {
  // 你的后端字段（原始）
  // 例如：id、tenantId、account、name、realName、roleId、roleName、postId、postName、deptId、deptName 等
  const roleIds = csv(data.roleId);
  const roleNames = csv(data.roleName);
  const postIds = csv(data.postId);
  const postNames = csv(data.postName);

  return {
    // —— 原样保留（常用的） —— //
    id: data.id, // 用户主键
    tenantId: data.tenantId,
    tenantName: data.tenantName,
    account: data.account,
    name: data.name, // 有些接口用 name，有些用 realName
    realName: data.realName,
    avatar: data.avatar || '',
    email: data.email || '',
    phone: data.phone || '',
    sex: data.sex, // 1/0
    sexName: data.sexName, // 男/女
    birthday: data.birthday || null,
    jobnum: data.jobnum || null,
    position: data.position || null,
    joinedDate: data.joinedDate || null,
    terminationDate: data.terminationDate || null,

    // 组织关系
    deptId: data.deptId || null,
    deptName: data.deptName || '',

    // 领导/扩展
    leaderId: data.leaderId || null,
    ehrLeaderId: data.ehrLeaderId || null,
    ehrSourceId: data.ehrSourceId || null,
    outType: data.outType || null,

    // 角色/岗位（数组化）
    roleIds,
    roleNames,
    postIds,
    postNames,

    // 身份/类型
    userType: data.userType, // 1
    userTypeName: data.userTypeName, // WEB

    // 状态派生
    status: data.status, // 1
    isDeleted: data.isDeleted === 1,
    isActive: data.status === 1 && data.isDeleted !== 1,

    // 其余原样透传（可按需扩展）
    code: data.code,
    country: data.country,
    rankWeight: data.rankWeight,
    dutyId: data.dutyId,
    dutyName: data.dutyName,
    pwStatus: data.pwStatus,
    roleStatus: data.roleStatus,
    personRoleId: data.personRoleId,
    userExt: data.userExt,

    // 审计字段
    createUser: data.createUser,
    createDept: data.createDept,
    createTime: data.createTime,
    updateUser: data.updateUser,
    updateTime: data.updateTime,

    // 兼容别名（便于项目统一使用）
    userId: data.id, // 常见别名
    username: data.account, // 你们账号形态
    real_name: data.realName, // 某些老代码习惯
  };
}
