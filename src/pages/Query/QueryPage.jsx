import { useState, useEffect } from 'react';
import { Play, Code, Plus, Trash2 } from 'lucide-react';
import { useEntities } from '../../hooks/useEntities';
import { queryService } from '../../services/api/query.service';

export const QueryPage = () => {
  const [selectedEntity, setSelectedEntity] = useState('');
  const [queryMode, setQueryMode] = useState('visual'); // 'visual' | 'json'
  const [filters, setFilters] = useState([{ field: '', operator: 'equals', value: '' }]);
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [limit, setLimit] = useState(50);
  const [jsonQuery, setJsonQuery] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [projectionFields, setProjectionFields] = useState(['']);
  const [schema, setSchema] = useState(null);
  
  const { data: entitiesData } = useEntities();

  const entities = entitiesData?.entities || [];
  const selectedEntityData = entities.find(e => e.name === selectedEntity);

  useEffect(() => {
    if (!selectedEntity) {
      setSchema(null);
      return;
    }

    const loadSchema = async () => {
      try {
        const data = await queryService.getSchema(selectedEntity);
        setSchema(data);
      } catch (err) {
        console.error("Failed to load schema", err);
      }
    };

    loadSchema();
  }, [selectedEntity]);

  const operatorOptions = {
    string: ["equals", "contains"],
    integer: ["equals", ">", ">=", "<", "<="],
    float: ["equals", ">", ">=", "<", "<="],
    number: ["equals", ">", ">=", "<", "<="],
    boolean: ["equals"],
    datetime: ["equals", ">", ">=", "<", "<="],
    default: ["equals"]
  };


  
  const addFilter = () => {
    setFilters([...filters, { field: '', operator: 'equals', value: '' }]);
  };
  
  const removeFilter = (index) => {
    setFilters(filters.filter((_, i) => i !== index));
  };
  
  const updateFilter = (index, key, value) => {
    const newFilters = [...filters];
    newFilters[index][key] = value;
    setFilters(newFilters);
  };
  
  const buildQuery = () => {
    if (queryMode === 'json') {
      try {
        return JSON.parse(jsonQuery);
      } catch (e) {
        throw new Error('Invalid JSON query');
      }
    }
    
    // Build query from visual builder
    const query = { entity: selectedEntity };

    // Add fields (projection)
    const cleanedFields = projectionFields.filter(f => f.trim() !== '');
    if (cleanedFields.length > 0) {
      query.fields = cleanedFields;
    }

    // Add filters
    const filterObj = {};
    filters.forEach(f => {
      if (f.field && f.value) {
        const operatorMap = {
          'equals': '$eq',
          'contains': '$regex',
          '>': '$gt',
          '>=': '$gte',
          '<': '$lt',
          '<=': '$lte'
        };
        filterObj[f.field] = { [operatorMap[f.operator] || '$eq']: f.value };
      }
    });
    if (Object.keys(filterObj).length > 0) {
      query.filters = filterObj;
    }
    
    // Add sort
    if (sortField) {
      query.sort = { [sortField]: sortDirection === 'asc' ? 1 : -1 };
    }
    
    // Add limit
    if (limit) {
      query.limit = parseInt(limit);
    }
    
    return query;
  };
  
  const handleExecuteQuery = async () => {
    if (!selectedEntity) {
      setError('Please select an entity');
      return;
    }
    
    setIsExecuting(true);
    setError(null);
    setResult(null);
    
    try {
      const query = buildQuery();
      const response = await queryService.executeQuery(query);
      setResult(response);
    } catch (err) {
      console.error('Query failed:', err);
      setError(err.message || err.response?.data?.detail || 'Failed to execute query');
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-text mb-6">Query Builder</h1>

      {/* Entity Selection */}
      <div className="mb-6 bg-surface border border-border rounded-lg p-6">
        <label className="block text-sm font-medium text-text mb-2">
          Select Entity
        </label>
        <select
          value={selectedEntity}
          onChange={(e) => setSelectedEntity(e.target.value)}
          className="w-full px-4 py-2 bg-surface-hover border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-secondary"
        >
          <option value="">Choose an entity...</option>
          {entities.map((entity) => (
            <option key={entity.name} value={entity.name}>
              {entity.name} ({entity.storage_type.toUpperCase()}) - {entity.record_count} records
            </option>
          ))}
        </select>
      </div>

      {selectedEntity && (
        <>
          {/* Mode Toggle */}
          <div className="mb-6 flex items-center gap-2">
            <button
              onClick={() => setQueryMode('visual')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium ${
                queryMode === 'visual'
                  ? 'bg-secondary text-black'
                  : 'bg-surface-hover text-text hover:bg-border'
              }`}
            >
              Visual Builder
            </button>
            <button
              onClick={() => setQueryMode('json')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium ${
                queryMode === 'json'
                  ? 'bg-secondary text-black'
                  : 'bg-surface-hover text-text hover:bg-border'
              }`}
            >
              <Code className="w-4 h-4" />
              JSON Editor
            </button>
          </div>

          {/* Query Builder */}
          {queryMode === 'visual' ? (
            <div className="mb-6 bg-surface border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-text mb-4">Filters</h3>
              
              {filters.map((filter, index) => (
                <div key={index} className="flex items-center gap-2 mb-3">
                  <select
                    value={filter.field}
                    onChange={(e) => updateFilter(index, 'field', e.target.value)}
                    className="flex-1 px-3 py-2 bg-surface-hover border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-secondary"
                  >
                    <option value="">Choose field...</option>

                    {schema?.fields?.map((f) => (
                      <option key={f.name} value={f.name}>
                        {f.name} ({f.type})
                      </option>
                    ))}
                  </select>

                  <select
                    value={filter.operator}
                    onChange={(e) => updateFilter(index, 'operator', e.target.value)}
                    className="px-3 py-2 bg-surface-hover border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-secondary"
                  >
                    {(
                      operatorOptions[
                        schema?.fields?.find((f) => f.name === filter.field)?.type
                      ] || operatorOptions.default
                    ).map((op) => (
                      <option key={op} value={op}>
                        {op}
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    placeholder="Value"
                    value={filter.value}
                    onChange={(e) => updateFilter(index, 'value', e.target.value)}
                    className="flex-1 px-3 py-2 bg-surface-hover border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-secondary"
                  />
                  <button
                    onClick={() => removeFilter(index)}
                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              
              <button
                onClick={addFilter}
                className="flex items-center gap-2 px-4 py-2 bg-surface-hover text-text rounded-lg hover:bg-border transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Filter
              </button>

              {/* Projection Fields */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-text mb-4">Projection Fields</h3>

                {projectionFields.map((field, index) => (
                  <div key={index} className="flex items-center gap-2 mb-3">
                    <select
                      value={field}
                      onChange={(e) => {
                        const updated = [...projectionFields];
                        updated[index] = e.target.value;
                        setProjectionFields(updated);
                      }}
                      className="flex-1 px-3 py-2 bg-surface-hover border text-white border-border rounded-lg"
                    >
                      <option value="">Choose field...</option>

                      {schema?.fields?.map(f => (
                        <option key={f.name} value={f.name}>
                          {f.name} ({f.type})
                        </option>
                      ))}
                    </select>


                    <button
                      onClick={() =>
                        setProjectionFields(projectionFields.filter((_, i) => i !== index))
                      }
                      className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                <button
                  onClick={() => setProjectionFields([...projectionFields, ''])}
                  className="flex items-center gap-2 px-4 py-2 bg-surface-hover text-text rounded-lg hover:bg-border transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Field
                </button>
              </div>


              <div className="mt-6 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-2">Sort By</label>
                  <select
                    value={sortField}
                    onChange={(e) => setSortField(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-hover border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-secondary"
                  >
                    <option value="">Choose field...</option>

                    {schema?.fields?.map((f) => (
                      <option key={f.name} value={f.name}>
                        {f.name}
                      </option>
                    ))}
                  </select>

                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-2">Direction</label>
                  <select
                    value={sortDirection}
                    onChange={(e) => setSortDirection(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-hover border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-secondary"
                  >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-text mb-2">Limit</label>
                <input
                  type="number"
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-hover border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-secondary"
                />
              </div>
            </div>
          ) : (
            <div className="mb-6 bg-surface border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-text mb-4">JSON Query</h3>
              <textarea
                value={jsonQuery}
                onChange={(e) => setJsonQuery(e.target.value)}
                placeholder={`{\n  "entity": "${selectedEntity}",\n  "filters": { "age": { "$gt": 25 } },\n  "sort": { "name": 1 },\n  "limit": 50\n}`}
                className="w-full h-64 px-4 py-3 bg-surface-hover border border-border rounded-lg text-text font-mono text-sm focus:outline-none focus:ring-2 focus:ring-secondary resize-none"
              />
            </div>
          )}

          {/* Execute Button */}
          <button
            onClick={handleExecuteQuery}
            disabled={isExecuting}
            className="flex items-center gap-2 px-6 py-3 bg-secondary text-black rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            <Play className="w-4 h-4" />
            {isExecuting ? 'Executing...' : 'Execute Query'}
          </button>
        </>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="mt-6 bg-surface border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-text">Results</h3>
            <div className="text-sm text-text-secondary">
              {result.returned_count} records • {result.query_time_ms}ms
            </div>
          </div>

          {result.data && result.data.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-surface-hover border-b border-border">
                  <tr>
                    {Object.keys(result.data[0]).map((key) => (
                      <th
                        key={key}
                        className="px-4 py-2 text-left text-xs font-medium text-text-secondary uppercase"
                      >
                        {key.replace(/_/g, ' ')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {result.data.map((row, index) => (
                    <tr key={index} className="hover:bg-surface-hover">
                      {Object.entries(row).map(([key, value], i) => {
                        
                        // Format timestamps if field looks like createdAt / updatedAt
                        const isDateField =
                          key.toLowerCase() === "createdat" ||
                          key.toLowerCase() === "updatedat" ||
                          key.toLowerCase() === "created_at" ||
                          key.toLowerCase() === "updated_at";

                        let displayValue = value;

                        if (isDateField && value) {
                          const date = new Date(value);
                          if (!isNaN(date.getTime())) {
                            displayValue = date.toLocaleString(); 
                            // Example: "1/18/2025, 2:22:05 PM"
                          }
                        }

                        return (
                          <td key={i} className="px-4 py-2 text-sm text-text">
                            {displayValue !== null && displayValue !== undefined
                              ? String(displayValue)
                              : "-"}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          ) : (
            <p className="text-text-secondary text-center py-8">No results found</p>
          )}
        </div>
      )}
    </div>
  );
};
