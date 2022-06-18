export default interface EntityOwnerInterface {
  getUserId();
}

export function instanceOfEntityOwnerInterface(
  data: any,
): data is EntityOwnerInterface {
  return 'getUserId' in data;
}
