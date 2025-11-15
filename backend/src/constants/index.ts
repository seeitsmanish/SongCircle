/**
 * Room Name Requirements:
 * - Between 3-30 characters
 * - Only letters (uppercase & lowercase), numbers, and hyphens
 * - No spaces allowed
 * - Hyphens only between alphanumerics (no leading/trailing/consecutive)
 * 
 * Valid examples: my-room, Room123, My-Test-Room
 * Invalid examples: my--room, -room, room-, MyRoom (if < 3 chars), a (if < 3 chars)
 */
export const ROOM_NAME_REGEX = /^(?=.{3,30}$)[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*$/;
