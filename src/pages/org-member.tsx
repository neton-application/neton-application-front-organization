"use client";
/**
 * 组织成员（后台治理）：选组织 → 列成员 → 批量把后台账号分配到该组织 / 改角色 / 移除。
 * 读 /admin/org/member/list?orgId=；写 /admin/org/member/assign、/update-role、/remove。
 * OWNER（主账号，role=1）行只读：不可改角色、不可移除（后端亦拦截）。
 */
import * as React from "react";
import { apiFetch, apiWrite } from "@neton/application-front-runtime/client";
import { useMutation, usePermission, useQuery, useQueryClient } from "@neton/application-front-runtime/client-context";
import { formatDateTime } from "@neton/application-front-runtime/types";
import { useT } from "@neton/application-front-runtime/i18n";
import { useWorkspaceRoute } from "@neton/application-front-workspace";
import {
  Button, ConfirmDialog, DataTable, Drawer, Field, PageHeader, RowActions,
  Select, Textarea, type DataColumn,
} from "@neton/application-front-kit";

interface OrgOption { id: number; name: string }
interface MemberRecord {
  orgId: number;
  accountId: number;
  role: number;
  status: number;
  source: number;
  joinedAt: number | null;
  nickname: string;
  avatar: string | null;
}

const ASSIGNABLE_ROLES = [2, 3];

export default function Page() {
  const t = useT("organization");
  const route = useWorkspaceRoute();
  const queryClient = useQueryClient();
  const canAssign = usePermission("organization:member:assign");
  const canUpdate = usePermission("organization:member:update");
  const canDelete = usePermission("organization:member:delete");

  const [orgId, setOrgId] = React.useState<string>(route.query.orgId ?? "");
  const [assignOpen, setAssignOpen] = React.useState(false);
  const [idsText, setIdsText] = React.useState("");
  const [assignRole, setAssignRole] = React.useState(3);
  const [removing, setRemoving] = React.useState<MemberRecord | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const orgs = useQuery({
    queryKey: ["org-options"],
    queryFn: () => apiFetch<OrgOption[]>("/admin/org/list"),
  });
  const selected = orgId !== "" ? Number(orgId) : 0;

  const members = useQuery({
    queryKey: ["org-members", selected],
    queryFn: () => apiFetch<MemberRecord[]>(`/admin/org/member/list?orgId=${selected}`),
    enabled: selected > 0,
  });
  const rows = members.data ?? [];

  const assign = useMutation({
    mutationFn: () => {
      const accountIds = idsText.split(",").map((s) => Number(s.trim())).filter((n) => Number.isFinite(n) && n > 0);
      return apiWrite<number>("/admin/org/member/assign", "POST", { orgId: selected, accountIds, role: assignRole });
    },
    onSuccess: async () => { setAssignOpen(false); setIdsText(""); await queryClient.invalidateQueries({ queryKey: ["org-members"] }); },
    onError: (cause: Error) => setError(cause.message),
  });
  const changeRole = useMutation({
    mutationFn: (args: { accountId: number; role: number }) =>
      apiWrite<void>("/admin/org/member/update-role", "POST", { orgId: selected, accountId: args.accountId, role: args.role }),
    onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ["org-members"] }); },
    onError: (cause: Error) => setError(cause.message),
  });
  const remove = useMutation({
    mutationFn: (record: MemberRecord) =>
      apiWrite<void>("/admin/org/member/remove", "POST", { orgId: selected, accountId: record.accountId }),
    onSuccess: async () => { setRemoving(null); await queryClient.invalidateQueries({ queryKey: ["org-members"] }); },
    onError: (cause: Error) => setError(cause.message),
  });

  const columns: DataColumn<MemberRecord>[] = [
    { key: "accountId", header: t("field.accountId"), cell: (row) => <code className="text-xs">{row.accountId}</code> },
    { key: "nickname", header: t("field.nickname"), cell: (row) => row.nickname || "-" },
    {
      key: "role", header: t("field.role"),
      cell: (row) => row.role === 1
        ? <span className="text-xs font-semibold">{t("role.1")}</span>
        : canUpdate
          ? <Select value={String(row.role)} onChange={(event) => { setError(null); changeRole.mutate({ accountId: row.accountId, role: Number(event.target.value) }); }}>
              {ASSIGNABLE_ROLES.map((value) => <option key={value} value={value}>{t(`role.${value}`)}</option>)}
            </Select>
          : <span className="text-xs">{t(`role.${row.role}`)}</span>,
    },
    { key: "source", header: t("field.source"), cell: (row) => t(`source.${row.source}`) },
    { key: "joinedAt", header: t("field.joinedAt"), cell: (row) => formatDateTime(row.joinedAt) },
    {
      key: "actions", header: t("action.operations"), headerClassName: "text-right", className: "text-right",
      cell: (row) => row.role === 1 ? null : (canDelete ? <RowActions more={[{ label: t("action.remove"), danger: true, onClick: () => setRemoving(row) }]} primary={[]} /> : null),
    },
  ];

  return <div className="space-y-4">
    <PageHeader eyebrow={t("eyebrow.organization")} title={t("memberList.title")} description={t("memberList.description")} actions={
      selected > 0 && canAssign ? <Button onClick={() => { setError(null); setAssignOpen(true); }}>{t("action.assign")}</Button> : undefined
    } />
    <div className="max-w-md"><Field label={t("memberList.selectOrg")}>
      <Select value={orgId} onChange={(event) => setOrgId(event.target.value)}>
        <option value="">{t("action.all")}</option>
        {(orgs.data ?? []).map((org) => <option key={org.id} value={String(org.id)}>{org.name}（#{org.id}）</option>)}
      </Select>
    </Field></div>
    {error && <div className="rounded-lg bg-red-50 p-3 text-xs text-red-700">{error}</div>}
    {selected > 0
      ? <section className="front-surface overflow-hidden rounded-xl">
          <DataTable columns={columns} rows={rows} rowKey={(row) => row.accountId} loading={members.isPending} error={members.error?.message} />
        </section>
      : <div className="rounded-xl border border-dashed border-[var(--border)] p-8 text-center text-sm text-[var(--muted-foreground)]">{t("memberList.empty")}</div>}

    <Drawer open={assignOpen} onClose={() => setAssignOpen(false)} title={t("memberList.assignTitle")} footer={<>
      <Button variant="ghost" onClick={() => setAssignOpen(false)}>{t("action.cancel")}</Button>
      <Button type="submit" form="org-assign-form" disabled={assign.isPending}>{t("memberList.assignSubmit")}</Button>
    </>}>
      <form id="org-assign-form" className="space-y-4" onSubmit={(event) => { event.preventDefault(); assign.mutate(); }}>
        <Field label={t("memberList.accountIds")}>
          <Textarea value={idsText} placeholder={t("memberList.accountIdsPlaceholder")} onChange={(event) => setIdsText(event.target.value)} />
        </Field>
        <Field label={t("memberList.assignRole")}>
          <Select value={String(assignRole)} onChange={(event) => setAssignRole(Number(event.target.value))}>
            {ASSIGNABLE_ROLES.map((value) => <option key={value} value={value}>{t(`role.${value}`)}</option>)}
          </Select>
        </Field>
      </form>
    </Drawer>
    <ConfirmDialog open={Boolean(removing)} title={`${t("action.remove")}${t("memberList.title")}`} description={t("memberList.removeConfirm")} confirmLabel={t("action.remove")} pending={remove.isPending} onCancel={() => setRemoving(null)} onConfirm={() => removing && remove.mutate(removing)} />
  </div>;
}
