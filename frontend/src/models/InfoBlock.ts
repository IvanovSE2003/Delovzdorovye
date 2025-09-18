export interface InfoBlockResponse {
  contents: InfoBlock[];
  totalCount: number;
  totalPages: number;
}

export interface InfoBlock {
  id: number;
  header?: string;
  text: string;
}
