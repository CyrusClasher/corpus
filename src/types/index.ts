export interface DocumentSummary {
  id: string;
  title: string;
  filename: string;
  fileType: "pdf" | "txt" | "md";
  fileSize: number;
  wordCount: number;
  uploadedAt: string;
}

export interface SearchResultItem {
  documentId: string;
  title: string;
  fileType: string;
  uploadedAt: string;
  wordCount: number;
  score: number;
  snippet: string;
  matchedWords: string[];
}

export interface SearchHistoryItem {
  id: string;
  query: string;
  resultCount: number;
  searchedAt: string;
}

export interface DashboardStats {
  totalDocuments: number;
  totalIndexedWords: number;
  totalSearches: number;
  avgSearchTimeMs: number;
  uploadsByType: { fileType: string; count: number }[];
  recentUploads: { id: string; title: string; fileType: string; uploadedAt: string }[];
}
