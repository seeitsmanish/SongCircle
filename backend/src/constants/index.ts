/**
 * Room Name Requirements:
 * - Only letters (uppercase & lowercase), numbers, and hyphens
 * - No spaces allowed
 * - Hyphens only between alphanumerics (no leading/trailing/consecutive)
 * 
 * Valid examples: my-room, Room123, My-Test-Room
 * Invalid examples: my--room, -room, room-
 */
export const ROOM_NAME_REGEX = /^[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*$/;
