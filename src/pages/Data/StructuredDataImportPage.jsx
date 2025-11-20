import { useState, useRef } from 'react';
import { Upload, FileJson, X, AlertCircle } from 'lucide-react';
import { structuredDataService } from '../../services/api/structuredData.service';
import { SchemaCard } from '../../components/structuredData/SchemaCard';
import { MergedSchemaCard } from '../../components/structuredData/MergedSchemaCard';
import { VarianceWarning } from '../../components/structuredData/VarianceWarning';
import { ExecutionProgress } from '../../components/structuredData/ExecutionProgress';
import { UPLOAD_CONFIG } from '../../config/upload.config';

export const StructuredDataImportPage = () => {
  // File selection state
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  // Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);

  // Decision state
  const [userDecisions, setUserDecisions] = useState({});
  const [useMergedSchema, setUseMergedSchema] = useState(false);
  const [mergedSchemaName, setMergedSchemaName] = useState('');
  const [userOverride, setUserOverride] = useState(false);
  const [acknowledgeRisks, setAcknowledgeRisks] = useState(false);

  // Execution state
  const [isExecuting, setIsExecuting] = useState(false);
  const [executeError, setExecuteError] = useState(null);
  const [jobId, setJobId] = useState(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.name.endsWith('.json')) {
        setAnalyzeError('Please select a JSON file');
        return;
      }

      // Validate file size
      if (file.size > UPLOAD_CONFIG.MAX_FILE_SIZE) {
        setAnalyzeError(`File size exceeds ${UPLOAD_CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB limit`);
        return;
      }

      setSelectedFile(file);
      setAnalyzeError(null);
      setAnalysisData(null);
      setUserDecisions({});
      setUseMergedSchema(false);
      setUserOverride(false);
      setAcknowledgeRisks(false);
    }
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setAnalysisData(null);
    setUserDecisions({});
    setAnalyzeError(null);
    setExecuteError(null);
    setUseMergedSchema(false);
    setUserOverride(false);
    setAcknowledgeRisks(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    setAnalyzeError(null);

    try {
      const result = await structuredDataService.analyzeFile(selectedFile);
      setAnalysisData(result);

      // Initialize decisions for each schema
      const initialDecisions = {};
      result.schemas_detected.forEach((schema) => {
        initialDecisions[schema.schema_id] = {
          action: 'create',
          custom_name: schema.suggested_name,
        };
      });
      setUserDecisions(initialDecisions);

      // Set merged schema name if available
      if (result.merged_schema) {
        setMergedSchemaName(result.merged_schema.suggested_name);
      }
    } catch (err) {
      console.error('Analysis failed:', err);
      setAnalyzeError(
        err.response?.data?.detail || err.message || 'Failed to analyze file. Please try again.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDecisionChange = (schemaId, decision) => {
    setUserDecisions((prev) => ({
      ...prev,
      [schemaId]: decision,
    }));
  };

  const handleSelectMergedSchema = () => {
    setUseMergedSchema(true);
    // Clear individual schema decisions
    setUserDecisions({});
  };

  const handleExecute = async () => {
    if (!analysisData) return;

    setIsExecuting(true);
    setExecuteError(null);

    try {
      let decisions = {};

      if (useMergedSchema && analysisData.merged_schema) {
        // Use merged schema
        decisions = {
          [analysisData.merged_schema.schema_id]: {
            action: 'create',
            custom_name: mergedSchemaName || analysisData.merged_schema.suggested_name,
          },
        };
      } else {
        // Use individual schemas (filter out skipped ones)
        decisions = Object.entries(userDecisions)
          .filter(([_, decision]) => decision.action !== 'skip')
          .reduce((acc, [schemaId, decision]) => {
            acc[schemaId] = decision;
            return acc;
          }, {});
      }

      // Check if at least one schema is selected
      if (Object.keys(decisions).length === 0) {
        setExecuteError('Please select at least one schema to upload');
        setIsExecuting(false);
        return;
      }

      const result = await structuredDataService.executeUpload(
        analysisData.analysis_id,
        decisions,
        userOverride,
        acknowledgeRisks
      );

      setJobId(result.job_id);
    } catch (err) {
      console.error('Execute failed:', err);
      setExecuteError(
        err.response?.data?.detail || err.message || 'Failed to execute upload. Please try again.'
      );
      setIsExecuting(false);
    }
  };

  const handleExecutionComplete = () => {
    // Execution complete, keep modal open
  };

  const handleCloseExecution = () => {
    setJobId(null);
    setIsExecuting(false);
    
    // Clear everything if successful
    if (analysisData) {
      handleClearFile();
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const isHighVariance = analysisData && (
    analysisData.variance_level === 'high' || analysisData.variance_level === 'extreme'
  );

  const needsOverride = isHighVariance && !useMergedSchema && Object.values(userDecisions).filter(d => d.action !== 'skip').length > 1;

  const canExecute = analysisData && (
    useMergedSchema ||
    Object.values(userDecisions).some(d => d.action !== 'skip')
  ) && (!needsOverride || (userOverride && acknowledgeRisks));

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-text mb-2">Structured Data Import</h1>
      <p className="text-text-secondary mb-6">
        Upload JSON files to import structured data into your database
      </p>

      {/* File Upload Section */}
      <div className="bg-surface border border-border rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-text mb-4">1. Select JSON File</h2>

        {!selectedFile ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-border hover:border-secondary/50 rounded-lg p-12 text-center cursor-pointer transition-colors hover:bg-surface-hover"
          >
            <FileJson className="w-12 h-12 text-text-muted mx-auto mb-4" />
            <p className="text-text mb-2">Click to select a JSON file</p>
            <p className="text-text-secondary text-sm">
              Maximum file size: {UPLOAD_CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        ) : (
          <div className="flex items-center justify-between p-4 bg-surface-hover rounded-lg">
            <div className="flex items-center gap-3">
              <FileJson className="w-6 h-6 text-secondary" />
              <div>
                <p className="text-text font-medium">{selectedFile.name}</p>
                <p className="text-text-secondary text-sm">{formatFileSize(selectedFile.size)}</p>
              </div>
            </div>
            <button
              onClick={handleClearFile}
              disabled={isAnalyzing || isExecuting}
              className="p-2 hover:bg-surface rounded-lg transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5 text-text" />
            </button>
          </div>
        )}

        {analyzeError && (
          <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-500 text-sm">{analyzeError}</p>
          </div>
        )}

        {selectedFile && !analysisData && (
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="mt-4 flex items-center gap-2 px-6 py-3 bg-secondary text-black rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isAnalyzing ? (
              <>
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Analyze File
              </>
            )}
          </button>
        )}
      </div>

      {/* Analysis Results */}
      {analysisData && (
        <>
          {/* Summary Banner */}
          <div className="bg-surface border border-border rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-text mb-4">2. Review Analysis</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-surface-hover rounded-lg">
                <p className="text-text-secondary text-sm mb-1">Total Records</p>
                <p className="text-2xl font-bold text-text">{analysisData.total_records}</p>
              </div>
              <div className="p-4 bg-surface-hover rounded-lg">
                <p className="text-text-secondary text-sm mb-1">Schemas Detected</p>
                <p className="text-2xl font-bold text-text">{analysisData.schemas_detected.length}</p>
              </div>
              <div className="p-4 bg-surface-hover rounded-lg">
                <p className="text-text-secondary text-sm mb-1">Schema Variants</p>
                <p className="text-2xl font-bold text-text">{analysisData.schema_variants}</p>
              </div>
              <div className="p-4 bg-surface-hover rounded-lg">
                <p className="text-text-secondary text-sm mb-1">Variance Level</p>
                <p className={`text-2xl font-bold capitalize ${UPLOAD_CONFIG.VARIANCE_COLORS[analysisData.variance_level]}`}>
                  {analysisData.variance_level}
                </p>
              </div>
            </div>
          </div>

          {/* Variance Warning */}
          <VarianceWarning
            varianceLevel={analysisData.variance_level}
            schemaVariants={analysisData.schema_variants}
            maxAllowed={analysisData.max_allowed_variants}
            recommendation={analysisData.recommendation}
            userOverride={userOverride}
            acknowledgeRisks={acknowledgeRisks}
            onUserOverrideChange={setUserOverride}
            onAcknowledgeRisksChange={setAcknowledgeRisks}
            showCheckboxes={!useMergedSchema && Object.values(userDecisions).filter(d => d.action !== 'skip').length > 1}
          />

          {/* Merged Schema Option */}
          {analysisData.merged_schema && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-text mb-4">Merged Schema Option</h2>
              <MergedSchemaCard
                mergedSchema={analysisData.merged_schema}
                isSelected={useMergedSchema}
                onSelect={handleSelectMergedSchema}
                customName={mergedSchemaName}
                onCustomNameChange={setMergedSchemaName}
                isDisabled={isExecuting}
              />
            </div>
          )}

          {/* Individual Schemas */}
          {!useMergedSchema && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-text mb-4">
                Individual Schemas ({analysisData.schemas_detected.length})
              </h2>
              <div className="space-y-4">
                {analysisData.schemas_detected.map((schema) => (
                  <SchemaCard
                    key={schema.schema_id}
                    schema={schema}
                    decision={userDecisions[schema.schema_id] || { action: 'create', custom_name: schema.suggested_name }}
                    onDecisionChange={handleDecisionChange}
                    isDisabled={isExecuting}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Execute Section */}
          <div className="bg-surface border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-text mb-4">3. Execute Upload</h2>

            {executeError && (
              <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-500 text-sm">{executeError}</p>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="text-sm text-text-secondary">
                {useMergedSchema ? (
                  <p>Ready to create merged schema: <span className="font-semibold text-text">{mergedSchemaName}</span></p>
                ) : (
                  <p>
                    {Object.values(userDecisions).filter(d => d.action !== 'skip').length} schema(s) selected for upload
                  </p>
                )}
              </div>
              <button
                onClick={handleExecute}
                disabled={!canExecute || isExecuting}
                className="flex items-center gap-2 px-6 py-3 bg-secondary text-black rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isExecuting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    Executing...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    Execute Upload
                  </>
                )}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Execution Progress Modal */}
      {jobId && (
        <ExecutionProgress
          jobId={jobId}
          onComplete={handleExecutionComplete}
          onClose={handleCloseExecution}
        />
      )}
    </div>
  );
};
