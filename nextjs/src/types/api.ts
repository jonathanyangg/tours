export interface UploadResult {
  success: boolean;
  message: string;
  data?: {
    totalRecords: number;
    processedRecords: number;
    errors?: string[];
  };
}

export interface ApiResponse<T = unknown> {
  status: 'success' | 'error' | 'warning';
  data?: T;
  message?: string;
} 