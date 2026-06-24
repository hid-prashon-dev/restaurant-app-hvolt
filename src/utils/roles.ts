export const ROLE_LABELS: Record<string, string> = {
  MASTER_ADMIN: 'Master Admin',
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  CASHIER: 'Cashier',
  WAITER: 'Waiter',
  KITCHEN_STAFF: 'Kitchen Staff',
  FRONT_DESK: 'Front Desk',
  HOUSEKEEPING: 'Housekeeping',
  INVENTORY_MANAGER: 'Inventory Manager',
  GUEST: 'Guest',
};

export function formatRoleLabel(role: string): string {
  return ROLE_LABELS[role] || role;
}
