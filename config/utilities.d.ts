declare let gitHash: string
declare function asyncForEach(
  array: any,
  limit: any,
  callback: any,
): Promise<number>
declare function sanitise(string: any): any
declare function loadTemplates(
  template: any,
  content?: string,
): Promise<unknown>
export { gitHash, asyncForEach, sanitise, loadTemplates }
