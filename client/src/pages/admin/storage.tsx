import React, { useState, useEffect } from 'react';
import AdminLayout from "@/components/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { apiRequest } from '@/lib/queryClient';
import { 
  Cloud, 
  HardDrive, 
  FileText, 
  Download,
  Trash2,
  RefreshCw,
  Upload,
  Eye,
  Calendar,
  HardDriveIcon
} from 'lucide-react';

interface StorageStatus {
  type: string;
  available: boolean;
  totalFiles: number;
  totalSize: number;
}

interface FileInfo {
  id?: string;
  name: string;
  size: number;
  mimeType?: string;
  createdTime?: string;
  modifiedTime?: string;
  webViewLink?: string;
  downloadUrl?: string;
}

export default function AdminStorage() {
  const [storageStatus, setStorageStatus] = useState<StorageStatus | null>(null);
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch storage status
      try {
        const statusData = await apiRequest('GET', '/api/storage/status');
        setStorageStatus(statusData);
      } catch (error) {
        console.error('Failed to fetch storage status:', error);
      }

      // Fetch files list
      try {
        const filesData = await apiRequest('GET', '/api/storage/files');
        setFiles(filesData);
      } catch (error) {
        console.error('Failed to fetch files:', error);
      }
    } catch (error) {
      console.error('Failed to fetch storage data:', error);
    } finally {
      setLoading(false);
      setLastUpdate(new Date());
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStorageIcon = (type: string) => {
    switch (type) {
      case 'google-drive':
        return <Cloud className="w-6 h-6 text-blue-500" />;
      case 'local':
        return <HardDrive className="w-6 h-6 text-green-500" />;
      default:
        return <HardDriveIcon className="w-6 h-6 text-gray-500" />;
    }
  };

  const getStorageBadge = (type: string) => {
    switch (type) {
      case 'google-drive':
        return <Badge variant="default" className="bg-blue-500">Google Drive</Badge>;
      case 'local':
        return <Badge variant="secondary" className="bg-green-500">Local Storage</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const handleDownload = async (file: FileInfo) => {
    try {
      if (file.downloadUrl) {
        // For Google Drive files
        window.open(file.downloadUrl, '_blank');
      } else {
        // For local files
        const response = await fetch(`/api/admin/files/${file.name}`);
        if (response.ok) {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = file.name;
          link.click();
          URL.revokeObjectURL(url);
        }
      }
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleView = (file: FileInfo) => {
    if (file.webViewLink) {
      window.open(file.webViewLink, '_blank');
    } else {
      window.open(`/api/admin/files/${file.name}`, '_blank');
    }
  };

  const handleDelete = async (file: FileInfo) => {
    if (!confirm(`Are you sure you want to delete "${file.name}"?`)) {
      return;
    }

    try {
      const url = file.id 
        ? `/api/admin/files/${file.name}?fileId=${file.id}`
        : `/api/admin/files/${file.name}`;
      
      const response = await fetch(url, { method: 'DELETE' });
      if (response.ok) {
        // Refresh the file list
        fetchData();
      } else {
        console.error('Delete failed');
      }
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  if (loading && !storageStatus) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading storage information...</span>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Storage Management</h1>
          <p className="text-gray-600">
            Manage files and storage configuration
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </span>
          <Button onClick={fetchData} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Storage Status */}
      {storageStatus && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {getStorageIcon(storageStatus.type)}
              <span>Storage Status</span>
              {getStorageBadge(storageStatus.type)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Status</p>
                <p className="text-2xl font-bold">
                  {storageStatus.available ? 'Available' : 'Unavailable'}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Total Files</p>
                <p className="text-2xl font-bold">{storageStatus.totalFiles}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Total Size</p>
                <p className="text-2xl font-bold">{formatFileSize(storageStatus.totalSize)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Files List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Files ({files.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {files.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No files found
            </div>
          ) : (
            <div className="space-y-4">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <FileText className="w-8 h-8 text-blue-500" />
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{formatFileSize(file.size)}</span>
                        {file.mimeType && <span>{file.mimeType}</span>}
                        {file.createdTime && (
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {formatDate(file.createdTime)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleView(file)}
                      title="View file"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(file)}
                      title="Download file"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(file)}
                      title="Delete file"
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Storage Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Storage Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Current Storage:</span>
                <Badge variant="outline">
                  {storageStatus?.type === 'google-drive' ? 'Google Drive' : 'Local Storage'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Status:</span>
                <Badge variant={storageStatus?.available ? "default" : "destructive"}>
                  {storageStatus?.available ? 'Available' : 'Unavailable'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>File Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Total Files:</span>
                <span className="font-medium">{storageStatus?.totalFiles || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Total Size:</span>
                <span className="font-medium">{formatFileSize(storageStatus?.totalSize || 0)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Average File Size:</span>
                <span className="font-medium">
                  {storageStatus?.totalFiles && storageStatus?.totalSize 
                    ? formatFileSize(storageStatus.totalSize / storageStatus.totalFiles)
                    : '0 B'
                  }
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </AdminLayout>
  );
}
