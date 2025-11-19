import { useState, useRef } from "react";
import PropTypes from "prop-types";
import { Upload, X, File, CheckCircle, AlertCircle } from "lucide-react";
import { mediaService } from "../../services/api/media.service";

export const FileUploadZone = ({ onUpload, onClose }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadResults, setUploadResults] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    setSelectedFiles((prev) => [...prev, ...files]);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles((prev) => [...prev, ...files]);
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setUploadProgress({});

    try {
      // Prepare cumulative sizes for per-file progress approximation
      const totalBytes = selectedFiles.reduce((s, f) => s + f.size, 0);
      let cum = 0;
      const fileRanges = selectedFiles.map((f) => {
        const start = cum;
        cum += f.size;
        return { start, size: f.size };
      });

      const onUploadProgress = (progressEvent) => {
        const loaded = progressEvent.loaded;
        const total = progressEvent.total || totalBytes;

        const newProgress = {};
        selectedFiles.forEach((_, index) => {
          const { start, size } = fileRanges[index];
          if (loaded >= start + size) {
            newProgress[index] = 100;
          } else if (loaded <= start) {
            newProgress[index] = 0;
          } else {
            const fileLoaded = Math.max(0, loaded - start);
            newProgress[index] = Math.min(
              100,
              Math.round((fileLoaded / size) * 100)
            );
          }
        });

        setUploadProgress((prev) => ({ ...prev, ...newProgress }));
      };

      const result = await mediaService.uploadMedia(selectedFiles, {
        onUploadProgress,
      });

      setUploadResults(result);

      // Wait a bit to show success, then close
      setTimeout(() => {
        onUpload(result);
        onClose();
      }, 1500);
    } catch (error) {
      console.error("Upload error:", error);
      const errorMessage =
        (error.response && error.response.data && error.response.data.detail) ||
        error.message ||
        "Upload failed. Please try again.";
      alert(`Upload failed: ${errorMessage}`);
      setUploadResults(null);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-surface rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-xl font-semibold text-text">Upload Files</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
            disabled={uploading}
          >
            <X className="w-5 h-5 text-text" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {!uploadResults ? (
            <>
              {/* Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
                  isDragging
                    ? "border-secondary bg-secondary/10"
                    : "border-border hover:border-secondary/50 hover:bg-surface-hover"
                }`}
              >
                <Upload className="w-12 h-12 text-text-muted mx-auto mb-4" />
                <p className="text-text mb-2">
                  Drag & drop files here, or click to select
                </p>
                <p className="text-text-secondary text-sm">
                  Support for images, videos, documents, and more
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {/* Selected Files */}
              {selectedFiles.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-text font-medium mb-3">
                    Selected Files ({selectedFiles.length})
                  </h3>
                  <div className="space-y-2 max-h-64 overflow-auto">
                    {selectedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-surface-hover rounded-lg"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <File className="w-5 h-5 text-text-muted flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-text text-sm truncate">
                              {file.name}
                            </p>
                            <p className="text-text-secondary text-xs">
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                        </div>
                        {!uploading && (
                          <button
                            onClick={() => removeFile(index)}
                            className="p-1 hover:bg-surface rounded transition-colors flex-shrink-0"
                          >
                            <X className="w-4 h-4 text-text-muted" />
                          </button>
                        )}
                        {uploading && uploadProgress[index] !== undefined && (
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <div className="w-24 h-2 bg-surface rounded-full overflow-hidden">
                              <div
                                className="h-full bg-secondary transition-all duration-300"
                                style={{ width: `${uploadProgress[index]}%` }}
                              />
                            </div>
                            <span className="text-xs text-text-secondary w-10 text-right">
                              {uploadProgress[index]}%
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Upload Results */
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-text mb-2">
                Upload Complete!
              </h3>
              <p className="text-text-secondary">
                Successfully uploaded {uploadResults.successful?.length || 0}{" "}
                file(s)
              </p>
              {uploadResults.failed?.length > 0 && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-red-500 text-sm">
                    {uploadResults.failed.length} file(s) failed to upload
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {!uploadResults && (
          <div className="flex items-center justify-between p-4 border-t border-border">
            <p className="text-text-secondary text-sm">
              {selectedFiles.length} file(s) selected
            </p>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                disabled={uploading}
                className="px-4 py-2 text-text hover:bg-surface-hover rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={selectedFiles.length === 0 || uploading}
                className="px-6 py-2 bg-secondary text-black rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {uploading ? "Uploading..." : "Upload"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

FileUploadZone.propTypes = {
  onUpload: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};
