export function formatAreaType(type: string): string {
  const map: Record<string, string> = {
    'DINING': 'Dining',
    'KITCHEN': 'Kitchen',
    'HOTEL_FLOOR': 'Hotel Floor',
    'HOUSEKEEPING_ZONE': 'Housekeeping Zone',
    'FRONT_DESK': 'Front Desk',
    'INVENTORY_STORAGE': 'Inventory Storage',
    'GENERAL': 'General',
  };
  return map[type] || type;
}

export function formatLocationType(type: string): string {
  const map: Record<string, string> = {
    'TABLE': 'Table',
    'ROOM': 'Room',
    'KITCHEN_STATION': 'Kitchen Station',
    'COUNTER': 'Counter',
    'FRONT_DESK_STATION': 'Front Desk Station',
    'STORAGE': 'Storage',
    'GENERAL': 'General',
  };
  return map[type] || type;
}

export function formatLocationStatus(status: string): string {
  const map: Record<string, string> = {
    'ACTIVE': 'Active',
    'INACTIVE': 'Inactive',
    'ARCHIVED': 'Archived',
  };
  return map[status] || status;
}
