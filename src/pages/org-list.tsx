"use client";
/**
 * 组织列表（后台治理）：GET /admin/org/page 服务端分页 + 名称过滤。
 * 行内动作：管理成员（跳转子页做批量分配）、启停（update-status）、删除（级联软删成员）。
 * 创建组织已收归后台（SPEC organization-integration §7.1）：POST /admin/org/create 建组织 +
 * 一体初始化负责人账号（新建账密 或 选定已有账号），负责人登录后即该组织 OWNER。
 */
import * as React from "react";
import { apiFetch, apiWrite } from "@neton/application-front-runtime/client";
import { useMutation, usePermission, useQuery, useQueryClient } from "@neton/application-front-runtime/client-context";
import { formatDateTime, type PageResponse } from "@neton/application-front-runtime/types";
import { useT } from "@neton/application-front-runtime/i18n";
import { useWorkspaceNavigation } from "@neton/application-front-workspace";
import {
  Button, ConfirmDialog, DataTable, Drawer, Field, FilterPanel, Input, PageHeader,
  Pagination, RowActions, Select, StatusBadge, Textarea, type DataColumn,
} from "@neton/application-front-kit";

interface OrgRecord {
  id: number;
  name: string;
  code: string;
  ownerAccountId: number;
  status: number;
  createdAt: number | null;
}

interface CreateForm {
  name: string;
  code: string;
  remark: string;
  ownerUsername: string;
  ownerPassword: string;
  ownerNickname: string;
  ownerAccountId: string;
}

const EMPTY_FORM: CreateForm = {
  name: "", code: "", remark: "",
  ownerUsername: "", ownerPassword: "", ownerNickname: "", ownerAccountId: "",
};

export default function Page() {
  const t = useT("organization");
  const navigation = useWorkspaceNavigation();
  const queryClient = useQueryClient();
  const canCreate = usePermission("organization:org:create");
  const canUpdate = usePermission("organization:org:update");
  const canDelete = usePermission("organization:org:delete");

  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(20);
  const [draftName, setDraftName] = React.useState("");
  const [name, setName] = React.useState("");
  const [deleting, setDeleting] = React.useState<OrgRecord | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const [createOpen, setCreateOpen] = React.useState(false);
  const [ownerMode, setOwnerMode] = React.useState<"new" | "existing">("new");
  const [form, setForm] = React.useState<CreateForm>(EMPTY_FORM);
  const set = (patch: Partial<CreateForm>) => setForm((prev) => ({ ...prev, ...patch }));

  const params = new URLSearchParams({ pageNo: String(page), pageSize: String(pageSize) });
  if (name) params.set("name", name);
  const query = useQuery({
    queryKey: ["org-list", page, pageSize, name],
    queryFn: () => apiFetch<PageResponse<OrgRecord>>(`/admin/org/page?${params}`),
  });
  const rows = query.data?.list ?? [];

  const toggle = useMutation({
    mutationFn: (record: OrgRecord) =>
      apiWrite<void>("/admin/org/update-status", "PUT", { id: record.id, status: record.status === 1 ? 0 : 1 }),
    onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ["org-list"] }); },
    onError: (cause: Error) => setError(cause.message),
  });
  const remove = useMutation({
    mutationFn: (record: OrgRecord) => apiWrite<void>(`/admin/org/delete/${record.id}`, "DELETE"),
    onSuccess: async () => { setDeleting(null); await queryClient.invalidateQueries({ queryKey: ["org-list"] }); },
    onError: (cause: Error) => setError(cause.message),
  });
  const create = useMutation({
    mutationFn: () => {
      const body: Record<string, unknown> = {
        name: form.name.trim(),
        code: form.code.trim(),
        remark: form.remark.trim(),
      };
      if (ownerMode === "existing") {
        body.ownerAccountId = Number(form.ownerAccountId);
      } else {
        body.ownerUsername = form.ownerUsername.trim();
        body.ownerPassword = form.ownerPassword;
        body.ownerNickname = form.ownerNickname.trim();
      }
      return apiWrite<OrgRecord>("/admin/org/create", "POST", body);
    },
    onSuccess: async () => {
      setCreateOpen(false); setForm(EMPTY_FORM); setOwnerMode("new");
      setPage(1); await queryClient.invalidateQueries({ queryKey: ["org-list"] });
    },
    onError: (cause: Error) => setError(cause.message),
  });

  const openCreate = () => { setError(null); setForm(EMPTY_FORM); setOwnerMode("new"); setCreateOpen(true); };
  const submitCreate = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!form.name.trim()) { setError(t("orgCreate.nameRequired")); return; }
    if (ownerMode === "new") {
      if (!form.ownerUsername.trim() || form.ownerPassword.length < 8) { setError(t("orgCreate.ownerRequired")); return; }
    } else if (!(Number(form.ownerAccountId) > 0)) {
      setError(t("orgCreate.ownerAccountIdRequired")); return;
    }
    create.mutate();
  };

  const columns: DataColumn<OrgRecord>[] = [
    { key: "id", header: t("field.id"), cell: (row) => <code className="text-xs">{row.id}</code> },
    { key: "name", header: t("field.name"), cell: (row) => row.name },
    { key: "code", header: t("field.code"), cell: (row) => row.code || "-" },
    { key: "ownerAccountId", header: t("field.ownerAccountId"), cell: (row) => <code className="text-xs">{row.ownerAccountId}</code> },
    { key: "status", header: t("field.status"), cell: (row) => <StatusBadge active={row.status === 1}>{t(`status.${row.status}`)}</StatusBadge> },
    { key: "createdAt", header: t("field.createdAt"), cell: (row) => formatDateTime(row.createdAt) },
    {
      key: "actions", header: t("action.operations"), headerClassName: "text-right", className: "text-right",
      cell: (row) => <RowActions primary={[
        { label: t("action.manageMembers"), tone: "primary", onClick: () => navigation.open(`/organization/member?orgId=${row.id}&name=${encodeURIComponent(row.name)}`) },
        ...(canUpdate ? [{ label: row.status === 1 ? t("action.disable") : t("action.enable"), onClick: () => { setError(null); toggle.mutate(row); } }] : []),
      ]} more={canDelete ? [{ label: t("action.delete"), danger: true, onClick: () => setDeleting(row) }] : []} />,
    },
  ];

  return <div className="space-y-4">
    <PageHeader eyebrow={t("eyebrow.organization")} title={t("orgList.title")} description={t("orgList.description")} actions={
      <div className="flex items-center gap-2">
        {canCreate && <Button onClick={openCreate}>{t("action.create")}</Button>}
        <Button variant="outline" onClick={() => query.refetch()} disabled={query.isFetching}>{t("action.refresh")}</Button>
      </div>
    } />
    <FilterPanel onSubmit={(event) => { event.preventDefault(); setPage(1); setName(draftName.trim()); }}>
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-48 flex-1"><Field label={t("field.name")}>
          <Input value={draftName} onChange={(event) => setDraftName(event.target.value)} />
        </Field></div>
        <Button type="button" variant="ghost" onClick={() => { setDraftName(""); setName(""); setPage(1); }}>{t("action.reset")}</Button>
        <Button type="submit">{t("action.search")}</Button>
      </div>
    </FilterPanel>
    {error && <div className="rounded-lg bg-red-50 p-3 text-xs text-red-700">{error}</div>}
    <section className="front-surface overflow-hidden rounded-xl">
      <DataTable columns={columns} rows={rows} rowKey={(row) => row.id} loading={query.isPending} error={query.error?.message} />
      <Pagination page={page} pageSize={pageSize} total={query.data?.total ?? 0} loading={query.isFetching}
        onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }} />
    </section>
    <Drawer open={createOpen} onClose={() => setCreateOpen(false)} title={t("orgCreate.title")} footer={<>
      <Button variant="ghost" onClick={() => setCreateOpen(false)}>{t("action.cancel")}</Button>
      <Button type="submit" form="org-create-form" disabled={create.isPending}>{t("orgCreate.submit")}</Button>
    </>}>
      <form id="org-create-form" className="space-y-4" onSubmit={submitCreate}>
        <Field label={t("field.name")}>
          <Input value={form.name} onChange={(event) => set({ name: event.target.value })} placeholder={t("orgCreate.namePlaceholder")} />
        </Field>
        <Field label={t("field.code")}>
          <Input value={form.code} onChange={(event) => set({ code: event.target.value })} placeholder={t("orgCreate.codePlaceholder")} />
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">{t("orgCreate.codeHint")}</p>
        </Field>
        <Field label={t("field.remark")}>
          <Textarea value={form.remark} onChange={(event) => set({ remark: event.target.value })} />
        </Field>

        <div className="border-t border-[var(--border)] pt-4">
          <Field label={t("orgCreate.ownerMode")}>
            <Select value={ownerMode} onChange={(event) => setOwnerMode(event.target.value as "new" | "existing")}>
              <option value="new">{t("orgCreate.ownerModeNew")}</option>
              <option value="existing">{t("orgCreate.ownerModeExisting")}</option>
            </Select>
          </Field>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">{t("orgCreate.ownerHint")}</p>
        </div>

        {ownerMode === "new" ? <>
          <Field label={t("field.ownerUsername")}>
            <Input value={form.ownerUsername} onChange={(event) => set({ ownerUsername: event.target.value })} placeholder="owner_acme" autoComplete="off" />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">{t("orgCreate.usernameHint")}</p>
          </Field>
          <Field label={t("field.ownerPassword")}>
            <Input type="password" value={form.ownerPassword} onChange={(event) => set({ ownerPassword: event.target.value })} autoComplete="new-password" />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">{t("orgCreate.passwordHint")}</p>
          </Field>
          <Field label={t("field.ownerNickname")}>
            <Input value={form.ownerNickname} onChange={(event) => set({ ownerNickname: event.target.value })} placeholder={t("orgCreate.nicknamePlaceholder")} />
          </Field>
        </> : <>
          <Field label={t("field.ownerAccountId")}>
            <Input value={form.ownerAccountId} onChange={(event) => set({ ownerAccountId: event.target.value.replace(/[^0-9]/g, "") })} inputMode="numeric" placeholder="1001" />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">{t("orgCreate.ownerAccountIdHint")}</p>
          </Field>
        </>}
      </form>
    </Drawer>

    <ConfirmDialog open={Boolean(deleting)} title={`${t("action.delete")}${t("orgList.title")}`} description={t("orgList.deleteConfirm")} confirmLabel={t("action.delete")} pending={remove.isPending} onCancel={() => setDeleting(null)} onConfirm={() => deleting && remove.mutate(deleting)} />
  </div>;
}
