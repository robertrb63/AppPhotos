
import React, { useState, useCallback } from 'react';
import { analyzeDocumentImage } from '../services/geminiService';
import { ExtractedData } from '../types';
import { UploadCloudIcon, ZapIcon, AlertTriangleIcon, UserIcon, FileDownIcon } from './Icons';
import Spinner from './Spinner';

// Let TypeScript know that XLSX is available on the window object
declare var XLSX: any;

const ImageAnalyzer: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedData[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const handleFileChange = (files: FileList | null) => {
    if (files && files[0]) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        setImageFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        setExtractedData(null);
        setError(null);
      } else {
        setError('Please upload a valid image file.');
      }
    }
  };

  const handleDragEvents = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFileChange(e.dataTransfer.files);
  };
  
  const handleAnalyzeClick = useCallback(async () => {
    if (!imageFile) {
      setError('Please select an image first.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setExtractedData(null);
    try {
      const data = await analyzeDocumentImage(imageFile);
      setExtractedData(data);
    } catch (err) {
      console.error(err);
      setError('Failed to analyze the image. The AI model might be unable to process this document. Please try another one.');
    } finally {
      setIsLoading(false);
    }
  }, [imageFile]);

  const handleExport = () => {
    if (!extractedData || extractedData.length === 0) return;

    const worksheetData = extractedData.map(person => ({
      "Nombre Completo": person.nombreCompleto || '',
      "Fecha de Nacimiento": person.fechaNacimiento || '',
      "Fecha de Bautismo": person.fechaBautismo || '',
      "Nombre del Padre": person.nombrePadre || '',
      "Nombre de la Madre": person.nombreMadre || '',
      "Abuelos Paternos": person.abuelosPaternos?.join(', ') || '',
      "Abuelos Maternos": person.abuelosMaternos?.join(', ') || '',
    }));

    const ws = XLSX.utils.json_to_sheet(worksheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Datos Extraídos");
    XLSX.writeFile(wb, "appphoto_data.xlsx");
  };

  const DataField: React.FC<{ label: string; value?: string | string[] | null }> = ({ label, value }) => {
    if (!value || (Array.isArray(value) && value.length === 0)) {
        return null;
    }
    const displayValue = Array.isArray(value) ? value.join(', ') : value;
    return (
        <div className="py-3 px-4 bg-gray-700/50 rounded-lg flex justify-between items-center text-left">
            <dt className="text-sm font-medium text-gray-400">{label}</dt>
            <dd className="mt-1 text-sm text-white sm:mt-0 text-right">{displayValue}</dd>
        </div>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-full">
      <div className="lg:w-1/2 flex flex-col items-center justify-center space-y-4">
        <input
            type="file"
            id="image-upload"
            className="hidden"
            accept="image/*"
            onChange={(e) => handleFileChange(e.target.files)}
        />
        <label
            htmlFor="image-upload"
            onDragEnter={handleDragEvents}
            onDragOver={handleDragEvents}
            onDragLeave={handleDragEvents}
            onDrop={handleDrop}
            className={`w-full h-64 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${isDragging ? 'border-blue-500 bg-blue-500/10' : 'border-gray-600 hover:border-blue-500 hover:bg-gray-700/50'}`}
        >
            {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="max-h-full max-w-full object-contain rounded-lg" />
            ) : (
                <div className="text-center text-gray-400">
                    <UploadCloudIcon className="w-12 h-12 mx-auto" />
                    <p className="mt-2 font-semibold">Drag & drop or click to upload</p>
                    <p className="text-xs">PNG, JPG, GIF up to 10MB</p>
                </div>
            )}
        </label>
        {imageFile && (
          <div className="w-full space-y-2">
             <button
                onClick={handleAnalyzeClick}
                disabled={isLoading}
                className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-all duration-300 ease-in-out hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed transform hover:scale-105"
            >
                {isLoading ? <><Spinner /> Analyzing...</> : <><ZapIcon className="w-5 h-5 mr-2" /> Analyze Document</>}
            </button>
            {extractedData && !isLoading && (
              <button
                onClick={handleExport}
                className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-all duration-300 ease-in-out hover:bg-green-700 transform hover:scale-105"
              >
                <FileDownIcon className="w-5 h-5 mr-2" />
                Export to Excel
              </button>
            )}
          </div>
        )}
         {error && (
          <div className="w-full bg-red-900/50 text-red-300 border border-red-700 p-3 rounded-lg flex items-center text-sm">
            <AlertTriangleIcon className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}
      </div>
      
      <div className="lg:w-1/2 flex flex-col">
        <h3 className="text-xl font-bold font-orbitron text-blue-300 mb-4">Extracted Data</h3>
        <div className="flex-grow bg-gray-900/50 p-4 rounded-lg border border-gray-700 overflow-y-auto">
            {isLoading && (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <Spinner size="lg" />
                    <p className="mt-4">AI is analyzing the document...</p>
                </div>
            )}
            {extractedData && (
                <div className="space-y-6">
                    {extractedData.map((person, index) => (
                         <div key={index} className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                            <h4 className="text-lg font-bold text-blue-400 mb-3 flex items-center">
                                <UserIcon className="w-5 h-5 mr-2" />
                                {person.nombreCompleto || `Person ${index + 1}`}
                            </h4>
                            <dl className="space-y-3">
                                <DataField label="Full Name" value={person.nombreCompleto} />
                                <DataField label="Date of Birth" value={person.fechaNacimiento} />
                                <DataField label="Date of Baptism" value={person.fechaBautismo} />
                                <DataField label="Father's Name" value={person.nombrePadre} />
                                <DataField label="Mother's Name" value={person.nombreMadre} />
                                <DataField label="Paternal Grandparents" value={person.abuelosPaternos} />
                                <DataField label="Maternal Grandparents" value={person.abuelosMaternos} />
                            </dl>
                        </div>
                    ))}
                </div>
            )}
            {!isLoading && !extractedData && (
                 <div className="flex flex-col items-center justify-center h-full text-gray-500 text-center">
                    <p>Upload a document and click "Analyze"</p>
                    <p>to see the extracted information here.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ImageAnalyzer;