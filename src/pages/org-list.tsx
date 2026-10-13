"use client";
/**
 * 组织列表（后台治理）：GET /admin/org/page 服务端分页 + 名称过滤。
 * 行内动作：管理成员（跳转子页做批量分配）、启停（update-status）、删除（级联软删成员）。
 * 后台不创建组织——组织由 C 端主账号创建；这里只做全局治理。
 */
import * as React from "react";
import { apiFetch, apiWrite } from "@neton/application-front-runtime/client";
import { useMutation, usePermission, useQuery, useQueryClient } from "@neton/application-front-runtime/client-context";
import { formatDateTime, type PageResponse } from "@neton/application-front-runtime/types";
import { useT } from "@neton/application-front-runtime/i18n";
import { useWorkspaceNavigation } from "@neton/application-front-workspace";
import {
  Button, ConfirmDialog, DataTable, Field, FilterPanel, Input, PageHeader,
  Pagination, RowActions, StatusBadge, type DataColumn,
} from "@neton/application-front-kit";

interface OrgRecord {
  id: number;
  name: string;
  code: string;
  ownerAccountId: number;
  status: number;
  createdAt: number | null;
}

export default function Page() {
  const t = useT("organization");
  const navigation = useWorkspaceNavigation();
  const queryClient = useQueryClient();
  const canUpdate = usePermission("organization:org:update");
  const canDelete = usePermission("organization:org:delete");

  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(20);
  const [draftName, setDraftName] = React.useState("");
  const [name, setName] = React.useState("");
  const [deleting, setDeleting] = React.useState<OrgRecord | null>(null);
  const [error, setError] = React.useState<string | null>(null);

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
      <Button variant="outline" onClick={() => query.refetch()} disabled={query.isFetching}>{t("action.refresh")}</Button>
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
    <ConfirmDialog open={Boolean(deleting)} title={`${t("action.delete")}${t("orgList.title")}`} description={t("orgList.deleteConfirm")} confirmLabel={t("action.delete")} pending={remove.isPending} onCancel={() => setDeleting(null)} onConfirm={() => deleting && remove.mutate(deleting)} />
  </div>;
}
