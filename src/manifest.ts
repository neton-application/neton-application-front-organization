import { defineFrontModule } from "@neton/application-front-contract";

/**
 * organization 模块前端清单（对标后端 neton-application-module-organization）。
 * page key == system_menus.component（见该仓 sql/postgresql/V002__organization_menus.sql）：
 *   organization/index        → 组织列表（全局治理：启停 / 删除 / 进入成员）
 *   organization/member/index → 组织成员（按组织批量分配账号 / 改角色 / 移除）
 */
export default defineFrontModule({
  id: "organization",
  contractVersion: "1.0.0",
  locales: [
    { lang: "zh-CN", entry: "zh-CN" },
    { lang: "en-US", entry: "en-US" },
  ],
  pages: [
    { key: "organization/index", path: "/organization/list", entry: "org-list", rendering: "client" },
    { key: "organization/member/index", path: "/organization/member", entry: "org-member", rendering: "client" },
  ],
});
