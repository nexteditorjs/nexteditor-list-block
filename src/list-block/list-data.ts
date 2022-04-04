export interface ListData {
  type: 'list';
  id: string;
  listType: 'ordered' | 'unordered' | 'checkbox';
  children: string[];
  [index: string]: unknown;
}
