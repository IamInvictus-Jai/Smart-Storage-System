import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, RefreshCw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useEntityData } from "../../hooks/useEntityData";
import { SearchBar } from "../../components/common/SearchBar";
import { queryService } from "../../services/api/query.service";

// Import the new display components
import { SQLDataTable } from "../../components/data/SQLDataTable";
import { NoSQLDocumentList } from "../../components/data/NoSQLDocumentList";

export const EntityDataPage = () => {
  const { dbType, entityName } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [schema, setSchema] = useState(null);

  // Conditional Schema Loading
  useEffect(() => {
    const loadSchema = async () => {
      if (dbType === "sql") {
        try {
          const data = await queryService.getSchema(entityName);
          setSchema(data);
        } catch (err) {
          console.error("Failed to load schema", err);
          setSchema(null);
        }
      } else {
        setSchema(null);
      }
    };

    loadSchema();
  }, [dbType, entityName]);

  const { data, isLoading, error, refetch } = useEntityData(entityName);

  const records = data?.data || [];

  const filteredRecords = useMemo(() => {
    if (!searchQuery) return records;
    const query = searchQuery.toLowerCase();
    return records.filter((record) =>
      Object.values(record).some((value) =>
        String(value).toLowerCase().includes(query)
      )
    );
  }, [records, searchQuery]);

  // Dynamic Column Calculation (Includes SQL Fallback)
  const columns = useMemo(() => {
    if (dbType === "sql" && schema?.fields) {
      return schema.fields.map((f) => f.name);
    }

    if (records.length > 0) {
      const allKeys = records.reduce((keys, record) => {
        Object.keys(record).forEach((key) => keys.add(key));
        return keys;
      }, new Set());

      return Array.from(allKeys);
    }

    return [];
  }, [dbType, schema, records]);

  // Handlers
  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    // Refresh both data and schema (if SQL)
    await Promise.all([
      refetch(),
      dbType === "sql" && queryClient.invalidateQueries(["schema", entityName]),
    ]);
    setIsRefreshing(false);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-6 h-8 bg-surface-hover rounded animate-pulse w-48" />
        <div className="bg-surface border border-border rounded-lg p-8">
          <div className="h-64 bg-surface-hover rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-text-secondary hover:text-text transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
        <div className="bg-surface border border-border rounded-lg p-8 text-center">
          <p className="text-red-500 mb-4">Failed to load entity data</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-secondary text-black rounded-lg hover:opacity-90 transition-opacity"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-text-secondary hover:text-text transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-text capitalize">
            {entityName.replace(/_/g, " ")} ({dbType.toUpperCase()})
          </h1>

          <div className="flex items-center gap-2">
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="p-2 hover:bg-surface-hover rounded-lg transition-colors disabled:opacity-50"
              title="Refresh data"
            >
              <RefreshCw
                className={`w-5 h-5 text-text ${
                  isRefreshing ? "animate-spin" : ""
                }`}
              />
            </button>

            <button
              onClick={() => navigate(`/data/${dbType}/${entityName}/new`)}
              className="flex items-center gap-2 px-4 py-2 bg-secondary text-black rounded-lg hover:opacity-90 transition-opacity font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Record
            </button>
          </div>
        </div>

        <SearchBar
          onSearch={setSearchQuery}
          placeholder={`Search ${entityName}...`}
          className="max-w-md"
        />
      </div>

      {/* Conditional Data Display */}
      {filteredRecords.length === 0 ? (
        <div className="bg-surface border border-border rounded-lg p-8 text-center">
          <p className="text-text-secondary">
            {searchQuery ? "No records match your search" : "No records found"}
          </p>
        </div>
      ) : dbType === "sql" ? (
        <SQLDataTable records={filteredRecords} columns={columns} />
      ) : (
        <NoSQLDocumentList records={filteredRecords} />
      )}
    </div>
  );
};
