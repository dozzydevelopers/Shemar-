import React, { useState } from 'react';
import { PHPFileExport } from '../types';
import { Code2, Copy, Check, Download, FileText, Database, Lock, Folder, X, Terminal } from 'lucide-react';

interface PHPCodeViewerModalProps {
  files: PHPFileExport[];
  onClose: () => void;
}

export const PHPCodeViewerModal: React.FC<PHPCodeViewerModalProps> = ({ files, onClose }) => {
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const selectedFile = files[selectedFileIndex] || files[0];

  const handleCopy = () => {
    if (!selectedFile) return;
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    if (!selectedFile) return;
    const blob = new Blob([selectedFile.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedFile.filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Title Bar */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-900/30">
              <Code2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>PHP + MySQL Source Code Inspector</span>
                <span className="bg-indigo-500/20 text-indigo-400 text-[10px] px-2 py-0.5 rounded-full font-semibold border border-indigo-500/30">
                  PHP 8.1+ / Apache
                </span>
              </h2>
              <p className="text-xs text-slate-400">Complete multi-tenant PHP codebase, PDO database migration, and .htaccess rules</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Workspace Layout */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-[500px]">
          {/* File Tree Sidebar */}
          <div className="w-full md:w-72 bg-slate-950 border-r border-slate-800 p-3 overflow-y-auto space-y-2 select-none shrink-0">
            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider px-2 mb-1">Source Code Files</p>
            {files.map((file, idx) => {
              const isSelected = idx === selectedFileIndex;
              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedFileIndex(idx)}
                  className={`w-full text-left p-2.5 rounded-xl font-mono text-xs flex items-center gap-2 transition-all ${
                    isSelected
                      ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-900/30'
                      : 'text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <FileText className="w-4 h-4 shrink-0 text-indigo-300" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate">{file.path}</p>
                    <span className="text-[9px] block opacity-75 font-sans font-normal truncate">{file.description}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Main Code Editor Panel */}
          <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
            {/* File Actions Sub-Header */}
            <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 font-mono text-xs text-indigo-400 font-bold">
                <Terminal className="w-4 h-4 text-indigo-400" />
                <span>/{selectedFile?.path}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition-all border border-slate-700"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied Code!' : 'Copy Code'}</span>
                </button>

                <button
                  onClick={handleDownloadFile}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold text-xs flex items-center gap-1.5 shadow transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download File</span>
                </button>
              </div>
            </div>

            {/* Code Body Container */}
            <div className="flex-1 overflow-auto p-4 bg-slate-950 font-mono text-xs text-slate-200 leading-relaxed select-text">
              <pre className="whitespace-pre-wrap break-words">{selectedFile?.content}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
