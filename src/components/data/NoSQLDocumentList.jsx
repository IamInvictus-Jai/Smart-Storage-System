// src/pages/EntityDataPage/components/NoSQLDocumentList.jsx
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
// REMOVED: Edit, Trash2

// Sub-component for a single document row
const NoSQLDocumentRow = ({ record }) => { // REMOVED: entityName, navigate, handleDelete
    const [isExpanded, setIsExpanded] = useState(false);

    // Get the keys for a quick compact summary
    const summaryKeys = Object.keys(record).slice(0, 3).filter(key => key !== 'id' && key !== '_id');
    const summaryText = summaryKeys.map(key => `${key}: ${JSON.stringify(record[key]).substring(0, 30)}...`).join(' | ');

    return (
        <div className="border-b border-border last:border-b-0">
            <div className="flex justify-between items-start p-4 hover:bg-surface-hover transition-colors">
                {/* Compact/Summary View */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <button 
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="p-1 rounded-full hover:bg-border/50 transition-colors flex-shrink-0"
                            title={isExpanded ? "Collapse" : "Expand"}
                        >
                            {isExpanded ? <ChevronDown className="w-4 h-4 text-text" /> : <ChevronRight className="w-4 h-4 text-text" />}
                        </button>
                        <span className="font-mono text-xs text-text-secondary flex-shrink-0">
                            ID: **{record.id || record._id || 'N/A'}**
                        </span>
                        <p className="text-sm text-text truncate ml-4 flex-1 min-w-0">
                            {summaryText || "{ Document fields are complex/empty }"}
                        </p>
                    </div>
                </div>

                {/* REMOVED: Actions 
                <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                    ... buttons ...
                </div> */}
            </div>

            {/* Expanded JSON View (MongoDB Compass style) */}
            {isExpanded && (
                <pre className="bg-surface-hover/50 p-4 pt-0 text-xs font-mono whitespace-pre-wrap break-all text-text-secondary">
                    {JSON.stringify(record, null, 2)}
                </pre>
            )}
        </div>
    );
};


// Main component
export const NoSQLDocumentList = ({ records }) => { // REMOVED: entityName, navigate, handleDelete
    return (
        <div className="bg-surface border border-border rounded-lg divide-y divide-border">
            {records.map((record, index) => (
                <NoSQLDocumentRow 
                    key={record.id || record._id || index}
                    record={record}
                />
            ))}
        </div>
    );
};