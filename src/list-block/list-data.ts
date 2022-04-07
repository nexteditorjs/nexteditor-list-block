export type ListType = 'ordered' | 'unordered' | 'checkbox';

export interface ListData {
  type: 'list';
  id: string;
  start?: number;
  listType: ListType;
  children: string[];
  [index: string]: unknown;
}

export function isSameListType(data1: ListData, data2: ListData): boolean {
  return data1.listType === data2.listType;
}
