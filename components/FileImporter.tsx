
import React, { useState, useRef } from 'react';
import { Trade, TradeType } from '../types';
import { extractTradesFromImage } from '../utils/dataProcessor';

interface FileImporterProps {
  onDataLoaded: (trades: Trade[], fileName: string) => void;
  onError: (message: string) => void;
}

const parseCSV = (csvText: string): Trade[] => {
    const lines = csvText.split('\n').filter(line => line.trim() !== '');
    if (lines.length < 2) {
        throw new Error("CSV is empty or contains only a header.");
    }
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, ''));
    const trades: Trade[] = [];
    const seenTrades = new Set<string>(); // For deduplication

    const requiredHeaders = ['pair', 'startdate', 'status', 'tradetype', 'profit/loss'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    if(missingHeaders.length > 0) {
        throw new Error(`Missing required columns: ${missingHeaders.join(', ')}. Found: ${headers.join(', ')}`);
    }

    const pairIndex = headers.indexOf('pair');
    const startDateIndex = headers.indexOf('startdate');
    const statusIndex = headers.indexOf('status');
    const tradeTypeIndex = headers.indexOf('tradetype');
    const pnlIndex = headers.indexOf('profit/loss');

    for (let i = 1; i < lines.length; i++) {
        const data = lines[i].split(',');
        try {
            const profitOrLossRaw = data[pnlIndex]?.trim().replace(/[\$,]/g, '');
            const profitOrLoss = parseFloat(profitOrLossRaw);
            if(isNaN(profitOrLoss)) {
                console.warn(`Skipping row with invalid PnL: ${lines[i]}`);
                continue;
            };

            const tradeTypeRaw = data[tradeTypeIndex]?.trim().toLowerCase();
            const tradeType = tradeTypeRaw === 'buy' ? TradeType.Buy : TradeType.Sell;

            const dateString = data[startDateIndex]?.trim();
            const startDate = new Date(dateString);
            if (isNaN(startDate.getTime())) {
                console.warn(`Skipping row with invalid date format: "${dateString}"`);
                continue;
            }

            const pair = data[pairIndex]?.trim();
            const tradeKey = `${startDate.toISOString()}_${pair}`;

            if (seenTrades.has(tradeKey)) {
                console.warn(`Skipping duplicate trade: ${lines[i]}`);
                continue;
            }
            seenTrades.add(tradeKey);

            const trade: Trade = {
                pair: pair,
                startDate: startDate,
                status: data[statusIndex]?.trim(),
                tradeType: tradeType,
                profitOrLoss: profitOrLoss,
            };
            trades.push(trade);
        } catch (e) {
            console.warn(`Skipping invalid row: ${lines[i]}`, e);
        }
    }
    return trades;
};


const FileImporter: React.FC<FileImporterProps> = ({ onDataLoaded, onError }) => {
  const [statusMessage, setStatusMessage] = useState('Click to upload a CSV or Image file(s)');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    onError('');

    try {
        const isSingleCsv = files.length === 1 && (files[0].type === 'text/csv' || files[0].name.endsWith('.csv'));
        const areAllImages = Array.from(files).every(f => f.type.startsWith('image/'));

        if (!isSingleCsv && !areAllImages) {
             throw new Error('Invalid selection. Please upload a single CSV file or one or more image files.');
        }

        let combinedCsvText = '';
        let fileNameForExport = files[0].name;

        if (isSingleCsv) {
            setStatusMessage('Processing CSV file...');
            combinedCsvText = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = (error) => reject(error);
                reader.readAsText(files[0]);
            });
        } else { // All images
            fileNameForExport = `${files.length}_images`;
            const csvResults: string[] = [];
            
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                setStatusMessage(`Analyzing image ${i + 1} of ${files.length}...`);
                const dataUrl = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result as string);
                    reader.onerror = (error) => reject(error);
                    reader.readAsDataURL(file);
                });
                
                const parts = dataUrl.split(',');
                const mimeType = parts[0].match(/:(.*?);/)![1];
                const base64Data = parts[1];
                
                const csvText = await extractTradesFromImage(base64Data, mimeType);
                if(csvText) {
                    csvResults.push(csvText);
                }
            }

            if (csvResults.length === 0) {
                throw new Error("Could not extract any data from the provided images.");
            }

            const firstCsv = csvResults[0];
            const header = firstCsv.split('\n')[0].trim();
            const allRows = [header];

            for (const csv of csvResults) {
                const lines = csv.split('\n');
                for (let i = 1; i < lines.length; i++) {
                    if (lines[i].trim()) {
                        allRows.push(lines[i].trim());
                    }
                }
            }
            combinedCsvText = allRows.join('\n');
        }
        
        setStatusMessage('Parsing extracted data...');
        const trades = parseCSV(combinedCsvText);
        onDataLoaded(trades, fileNameForExport);

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        onError(errorMessage);
        onDataLoaded([], '');
    } finally {
        setIsProcessing(false);
        setStatusMessage('Click to upload a CSV or Image file(s)');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }
  };
  
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-4">
        <label htmlFor="file-upload" className={`relative ${isProcessing ? 'cursor-wait' : 'cursor-pointer'}`}>
            <div className="w-full bg-brand-surface border-2 border-dashed border-brand-border rounded-lg p-6 text-center hover:border-brand-primary transition-colors">
                <svg className="mx-auto h-12 w-12 text-brand-text-secondary" stroke="currentColor" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2z" />
                </svg>
                <span className="mt-2 block text-sm font-semibold text-brand-text-primary">
                  {isProcessing ? statusMessage : 'Click to upload a CSV or Image file(s)'}
                </span>
                <span className="mt-1 block text-xs text-brand-text-secondary">
                  Upload a single CSV or one or more images. For CSVs, headers must include: Pair, Start Date, Status, Trade Type, Profit/Loss.
                </span>
            </div>
            <input 
                id="file-upload" 
                name="file-upload" 
                type="file" 
                className="sr-only" 
                accept=".csv,image/png,image/jpeg,image/webp"
                onChange={handleFileChange}
                disabled={isProcessing}
                ref={fileInputRef}
                multiple
            />
        </label>
    </div>
  );
};

export default FileImporter;
