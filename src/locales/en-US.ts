/** English messages for the `organization` module. Keys must mirror zh-CN.ts exactly. */
const messages: Record<string, string> = {
  "menu.organization/index": "Organizations",
  "menu.organization/member/index": "Org Members",

  "eyebrow.organization": "ORGANIZATION",

  "action.refresh": "Refresh",
  "action.save": "Save",
  "action.cancel": "Cancel",
  "action.delete": "Delete",
  "action.search": "Search",
  "action.reset": "Reset",
  "action.all": "All",
  "action.operations": "Actions",
  "action.enable": "Enable",
  "action.disable": "Disable",
  "action.manageMembers": "Members",
  "action.assign": "Batch Assign",
  "action.changeRole": "Change Role",
  "action.remove": "Remove",

  "field.id": "ID",
  "field.name": "Name",
  "field.code": "Code",
  "field.ownerAccountId": "Owner Account",
  "field.status": "Status",
  "field.createdAt": "Created At",
  "field.remark": "Remark",
  "field.accountId": "Account ID",
  "field.nickname": "Nickname",
  "field.role": "Role",
  "field.source": "Source",
  "field.joinedAt": "Joined At",

  "status.0": "Disabled",
  "status.1": "Active",

  "role.1": "Owner",
  "role.2": "Admin",
  "role.3": "Member",

  "source.1": "Owner",
  "source.2": "Backend Assigned",
  "source.3": "Invite Code",
  "source.4": "Backend Invited",

  "orgList.title": "Organizations",
  "orgList.description": "Govern all organizations: enable/disable, delete, and open members for batch assignment.",
  "orgList.deleteConfirm": "Deleting cascade-soft-deletes all its members; the organization will no longer show.",

  "memberList.title": "Organization Members",
  "memberList.description": "Pick an organization, batch-assign backend accounts into it; the owner then maintains members on the client.",
  "memberList.selectOrg": "Select organization",
  "memberList.empty": "Select an organization first.",
  "memberList.assignTitle": "Batch assign accounts to organization",
  "memberList.accountIds": "Account IDs (comma separated)",
  "memberList.accountIdsPlaceholder": "e.g. 1001,1002,1003",
  "memberList.assignRole": "Assigned role",
  "memberList.assignSubmit": "Confirm assign",
  "memberList.removeConfirm": "Remove this account from the organization (the account itself is untouched).",
};

export default messages;
