/** 模块 `organization` 的 zh-CN 词条（命名空间 = 模块 id）。key 在各语言间必须一致。 */
const messages: Record<string, string> = {
  // 菜单
  "menu.organization/index": "组织列表",
  "menu.organization/member/index": "组织成员",

  // 装饰眉标
  "eyebrow.organization": "ORGANIZATION",

  // 通用动作
  "action.refresh": "刷新",
  "action.save": "保存",
  "action.cancel": "取消",
  "action.delete": "删除",
  "action.search": "查询",
  "action.reset": "重置",
  "action.all": "全部",
  "action.operations": "操作",
  "action.enable": "启用",
  "action.disable": "停用",
  "action.manageMembers": "管理成员",
  "action.assign": "批量分配",
  "action.changeRole": "改角色",
  "action.remove": "移除",
  "action.create": "创建组织",

  // 字段
  "field.id": "编号",
  "field.name": "组织名称",
  "field.code": "组织标识",
  "field.ownerAccountId": "主账号 ID",
  "field.status": "状态",
  "field.createdAt": "创建时间",
  "field.remark": "简介",
  "field.accountId": "账号 ID",
  "field.nickname": "昵称",
  "field.role": "角色",
  "field.source": "来源",
  "field.joinedAt": "加入时间",
  "field.ownerUsername": "负责人账号名",
  "field.ownerPassword": "负责人密码",
  "field.ownerNickname": "负责人昵称",

  // 组织状态
  "status.0": "停用",
  "status.1": "正常",

  // 成员角色（OrgRole）
  "role.1": "主账号",
  "role.2": "管理员",
  "role.3": "成员",

  // 成员来源（OrgMemberSource）
  "source.1": "创建人",
  "source.2": "后台分配",
  "source.3": "邀请码",
  "source.4": "后台邀请",

  // 组织列表页
  "orgList.title": "组织列表",
  "orgList.description": "创建组织并初始化负责人账号；全局治理所有组织：启用/停用、删除，并进入其成员做批量分配。",
  "orgList.deleteConfirm": "删除会级联软删该组织的全部成员，组织本体不再展示。",

  // 创建组织（§7.1：后台建组织 + 一体初始化负责人账号）
  "orgCreate.title": "创建组织",
  "orgCreate.submit": "确认创建",
  "orgCreate.namePlaceholder": "例如 Acme Inc.",
  "orgCreate.codePlaceholder": "必填，全局唯一，例如 shang",
  "orgCreate.codeHint": "必填。2-20 位，小写字母开头，仅小写字母/数字/下划线；它是子账号登录名的前缀（如标识 shang → 子账号 shang1、shang2）。",
  "orgCreate.ownerMode": "负责人账号",
  "orgCreate.ownerModeNew": "新建负责人账号",
  "orgCreate.ownerModeExisting": "使用已有账号",
  "orgCreate.ownerHint": "负责人账号由后台初始化，登录后即该组织主账号（OWNER），可为本组织添加成员。",
  "orgCreate.usernameHint": "3-32 位，小写字母开头，仅小写字母/数字/下划线。",
  "orgCreate.passwordHint": "至少 8 位。",
  "orgCreate.nicknamePlaceholder": "留空则用账号名",
  "orgCreate.ownerAccountIdHint": "选定一个已存在的账号 ID 作为负责人。",
  "orgCreate.nameRequired": "请填写组织名称。",
  "orgCreate.codeRequired": "请填写组织标识。",
  "orgCreate.codeInvalid": "组织标识格式：2-20 位，小写字母开头，仅小写字母/数字/下划线。",
  "orgCreate.ownerRequired": "请填写负责人账号名，密码至少 8 位。",
  "orgCreate.ownerAccountIdRequired": "请填写有效的负责人账号 ID。",

  // 组织成员页
  "memberList.title": "组织成员",
  "memberList.description": "选择一个组织，批量把后台账号分配到该组织，之后由该组织主账号自行维护。",
  "memberList.selectOrg": "选择组织",
  "memberList.empty": "请先选择一个组织。",
  "memberList.assignTitle": "批量分配账号到组织",
  "memberList.accountIds": "账号 ID（英文逗号分隔）",
  "memberList.accountIdsPlaceholder": "例如 1001,1002,1003",
  "memberList.assignRole": "分配角色",
  "memberList.assignSubmit": "确认分配",
  "memberList.removeConfirm": "将该账号从此组织移除（不影响其账号本身）。",
};

export default messages;
