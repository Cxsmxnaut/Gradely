import { useState, useEffect } from 'react';
import { FileText, Download, Search, Filter, File } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { fetchDocuments } from '@/adapters/dataService';
import { Document } from '@/types';

export function DocumentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [documents, setDocuments] = useState<Document[]>([]);

  useEffect(() => {
    const loadDocuments = async () => {
      try {
        const documentsData = await fetchDocuments();
        setDocuments(documentsData);
      } catch (error) {
        console.error('Failed to load documents:', error);
        // Set empty array as fallback since fetchDocuments is not implemented yet
        setDocuments([]);
      }
    };

    loadDocuments();
  }, []);

  // Filter documents based on search and type
  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || doc.type === typeFilter;
    return matchesSearch && matchesType;
  });

  // Get unique document types
  const documentTypes = Array.from(new Set(documents.map((doc) => doc.type)));

  const getFileIcon = (_type: string) => {
    return <FileText className="size-8 text-blue-600" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Documents</h1>
        <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 mt-1">
          Access your reports, transcripts, and other important documents
        </p>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-500" />
              <Input
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Type Filter */}
            <div className="sm:w-48">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <Filter className="size-4 mr-2" />
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {documentTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results count */}
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-4">
            Showing {filteredDocuments.length} of {documents.length} documents
          </p>
        </CardContent>
      </Card>

      {/* Documents Grid */}
      {filteredDocuments.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <File className="size-12 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                No documents found
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 mt-2">
                Try adjusting your search or filters
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments.map((doc) => (
            <Card
              key={doc.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
            >
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  {/* File Icon */}
                  <div className="size-16 rounded-lg bg-blue-50 dark:bg-blue-950/20 flex items-center justify-center mb-4">
                    {getFileIcon(doc.type)}
                  </div>

                  {/* File Name */}
                  <h3 className="font-semibold text-sm mb-2 line-clamp-2">
                    {doc.name}
                  </h3>

                  {/* File Type Badge */}
                  <Badge variant="secondary" className="mb-3">
                    {doc.type}
                  </Badge>

                  {/* File Info */}
                  <div className="text-xs text-neutral-600 dark:text-neutral-400 space-y-1 mb-4">
                    <p>{formatDate(doc.date)}</p>
                    <p>{doc.size}</p>
                  </div>

                  {/* Download Button */}
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      // In a real app, this would download the file
                      console.log('Downloading:', doc.name);
                    }}
                  >
                    <Download className="size-4 mr-2" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Document Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {documents.length}
              </div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                Total Documents
              </div>
            </div>

            {documentTypes.map((type) => {
              const count = documents.filter((doc) => doc.type === type).length;
              return (
                <div
                  key={type}
                  className="text-center p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg"
                >
                  <div className="text-2xl font-bold">{count}</div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                    {type} Files
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
