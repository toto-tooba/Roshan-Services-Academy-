export interface ExtractedReceiptData {
  receiverName: string;
  receiverNumber: string;
  senderName: string;
  senderNumber: string;
  amount: string;
  transactionId: string;
  date: string;
  time: string;
  paymentProvider: string;
  isGenuineReceipt: boolean;
}

export interface VerificationResult {
  status: 'verified' | 'manual_review' | 'rejected';
  score: number;
  extracted: ExtractedReceiptData;
  rejectionReasons: string[];
  breakdown: {
    receiverMatch: number;
    amountMatch: number;
    transactionIdFound: number;
    dateTimeFound: number;
    senderInfoFound: number;
  };
}

function getLevenshteinDistance(a: string, b: string): number {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

function getFuzzySimilarity(s1: string, s2: string): number {
  const clean1 = s1.toLowerCase().replace(/[^a-z0-9]/g, '');
  const clean2 = s2.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (clean1 === clean2) return 1.0;
  if (clean1.length === 0 || clean2.length === 0) return 0.0;
  
  const distance = getLevenshteinDistance(clean1, clean2);
  const longestLength = Math.max(clean1.length, clean2.length);
  return (longestLength - distance) / longestLength;
}

function verifyNumber(extracted: string, configured: string): boolean {
  if (!extracted || !configured) return false;
  const cleanExtracted = extracted.replace(/\D/g, ''); 
  const cleanConfigured = configured.replace(/\D/g, '');
  
  if (cleanExtracted && cleanExtracted.length >= 7) {
    return cleanExtracted.endsWith(cleanConfigured.slice(-7)) || cleanConfigured.endsWith(cleanExtracted.slice(-7));
  }
  
  const maskedMatch = extracted.match(/(\d{3,5})$/);
  if (maskedMatch) {
    const lastDigits = maskedMatch[1];
    return cleanConfigured.endsWith(lastDigits);
  }
  return false;
}

function cleanAmount(val: string | number): number {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  // Strip non-numeric, strip Rs, ignore dots if they are for cents at the end (.00)
  const cleanStr = val.toString().replace(/rs\.?/gi, '').replace(/,/g, '').trim();
  const parsed = parseFloat(cleanStr);
  return isNaN(parsed) ? 0 : Math.round(parsed);
}

export function calculateVerificationScore(
  extracted: ExtractedReceiptData,
  configuredName: string,
  configuredNumber: string,
  configuredFee: number
): {
  score: number;
  breakdown: {
    receiverMatch: number;
    amountMatch: number;
    transactionIdFound: number;
    dateTimeFound: number;
    senderInfoFound: number;
  };
  rejectionReasons: string[];
  isReceiverVerified: boolean;
  isAmountVerified: boolean;
  isTxIdFound: boolean;
} {
  const breakdown = {
    receiverMatch: 0,
    amountMatch: 0,
    transactionIdFound: 0,
    dateTimeFound: 0,
    senderInfoFound: 0
  };
  const rejectionReasons: string[] = [];

  // 1. Receiver Match (40 Points)
  const similarity = getFuzzySimilarity(extracted.receiverName || '', configuredName);
  const isNameMatched = similarity >= 0.85;
  const isNumberMatched = verifyNumber(extracted.receiverNumber || '', configuredNumber);

  const isReceiverVerified = isNameMatched && isNumberMatched;
  if (isReceiverVerified) {
    breakdown.receiverMatch = 40;
  } else {
    if (!isNameMatched && extracted.receiverName) {
      rejectionReasons.push(`Receiver name on receipt ("${extracted.receiverName}") is not a valid match for the academy account owner ("${configuredName}")`);
    } else if (!extracted.receiverName) {
      rejectionReasons.push(`Could not verify receiver name on the receipt.`);
    }
    if (!isNumberMatched && extracted.receiverNumber) {
      rejectionReasons.push(`Receiver number on receipt ("${extracted.receiverNumber}") does not match the academy account number ("${configuredNumber}")`);
    } else if (!extracted.receiverNumber) {
      rejectionReasons.push(`Could not verify receiver account or wallet number on the receipt.`);
    }
    
    // Partial credits
    if (isNameMatched) breakdown.receiverMatch += 20;
    if (isNumberMatched) breakdown.receiverMatch += 20;
  }

  // 2. Amount Match (25 Points)
  const parsedExtractedAmount = cleanAmount(extracted.amount);
  const isAmountVerified = parsedExtractedAmount === configuredFee;

  if (isAmountVerified) {
    breakdown.amountMatch = 25;
  } else {
    rejectionReasons.push(`Amount on receipt (Rs. ${parsedExtractedAmount}) does not match the course fee (Rs. ${configuredFee})`);
  }

  // 3. Transaction ID Found (15 Points)
  const isTxIdFound = !!(extracted.transactionId && extracted.transactionId.trim().length >= 4);
  if (isTxIdFound) {
    breakdown.transactionIdFound = 15;
  } else {
    rejectionReasons.push(`Transaction Reference ID was not found on the receipt.`);
  }

  // 4. Date & Time Found (10 Points)
  const hasDate = !!(extracted.date && extracted.date.trim().length > 3);
  const hasTime = !!(extracted.time && extracted.time.trim().length > 2);
  if (hasDate && hasTime) {
    breakdown.dateTimeFound = 10;
  } else if (hasDate || hasTime) {
    breakdown.dateTimeFound = 5;
  }

  // 5. Sender Information Found (10 Points)
  const hasSenderName = !!(extracted.senderName && extracted.senderName.trim().length > 1);
  const hasSenderNumber = !!(extracted.senderNumber && extracted.senderNumber.trim().length > 3);
  if (hasSenderName && hasSenderNumber) {
    breakdown.senderInfoFound = 10;
  } else if (hasSenderName || hasSenderNumber) {
    breakdown.senderInfoFound = 5;
  }

  const score = breakdown.receiverMatch + breakdown.amountMatch + breakdown.transactionIdFound + breakdown.dateTimeFound + breakdown.senderInfoFound;

  return {
    score,
    breakdown,
    rejectionReasons,
    isReceiverVerified,
    isAmountVerified,
    isTxIdFound
  };
}

const compressImage = (file: File): Promise<File> => {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) {
      resolve(file);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 1200;
        
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
                type: 'image/jpeg',
                lastModified: Date.now()
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          }, 'image/jpeg', 0.8);
        } else {
          resolve(file);
        }
      };
      img.onerror = () => resolve(file);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
};

export const verifyPaymentReceipt = async (
  file: File,
  configuredName: string,
  configuredNumber: string,
  configuredFee: number,
  tidInput: string
): Promise<VerificationResult> => {
  // Compress image if it is an image file to reduce file size and speed up OCR analysis
  let fileToUpload = file;
  if (file.type.startsWith('image/')) {
    try {
      fileToUpload = await compressImage(file);
    } catch (compressErr) {
      console.warn("Client-side image compression failed, using original file:", compressErr);
    }
  }

  // 1. Upload to backend /api/upload
  const formData = new FormData();
  formData.append('file', fileToUpload);

  const uploadRes = await fetch('/api/upload', {
    method: 'POST',
    body: formData
  });

  if (!uploadRes.ok) {
    let errMsg = `Upload failed with status ${uploadRes.status}`;
    try {
      const text = await uploadRes.text();
      try {
        const errData = JSON.parse(text);
        errMsg = errData.error || errData.message || errMsg;
      } catch (e) {
        // Not JSON, extract any text from HTML <pre> or <h1> or fallback to first 120 chars
        const docMatch = text.match(/<pre>([\s\S]*?)<\/pre>/i) || text.match(/<h1>([\s\S]*?)<\/h1>/i);
        if (docMatch) {
          errMsg = docMatch[1].replace(/<[^>]*>/g, '').trim();
        } else {
          errMsg = text.slice(0, 120).trim() || errMsg;
        }
      }
    } catch (textErr) {
      // ignore
    }
    throw new Error(errMsg);
  }

  let uploadData;
  const uploadText = await uploadRes.text();
  try {
    uploadData = JSON.parse(uploadText);
  } catch (e) {
    throw new Error(`Invalid server response on upload: ${uploadText.slice(0, 120)}`);
  }
  const fileUrl = uploadData.url;

  // 2. Call /api/verify-receipt to do Gemini parsing
  const verifyRes = await fetch('/api/verify-receipt', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ url: fileUrl })
  });

  if (!verifyRes.ok) {
    let errMsg = `Receipt analysis failed with status ${verifyRes.status}`;
    try {
      const text = await verifyRes.text();
      try {
        const errData = JSON.parse(text);
        errMsg = errData.error || errData.message || errMsg;
      } catch (e) {
        const docMatch = text.match(/<pre>([\s\S]*?)<\/pre>/i) || text.match(/<h1>([\s\S]*?)<\/h1>/i);
        if (docMatch) {
          errMsg = docMatch[1].replace(/<[^>]*>/g, '').trim();
        } else {
          errMsg = text.slice(0, 120).trim() || errMsg;
        }
      }
    } catch (textErr) {
      // ignore
    }
    throw new Error(errMsg);
  }

  let verifyData;
  const verifyText = await verifyRes.text();
  try {
    verifyData = JSON.parse(verifyText);
  } catch (e) {
    throw new Error(`Invalid server response on verify: ${verifyText.slice(0, 120)}`);
  }
  const { extracted } = verifyData;
  
  if (tidInput && !extracted.transactionId) {
    extracted.transactionId = tidInput;
  }

  // 3. Score the receipt
  const scorer = calculateVerificationScore(extracted, configuredName, configuredNumber, configuredFee);

  // 4. Check duplicate transaction
  const { checkDuplicateTransaction } = await import('./databaseService');
  const isDuplicate = await checkDuplicateTransaction(extracted.transactionId || tidInput);
  
  if (isDuplicate) {
    scorer.rejectionReasons.push("This transaction has already been claimed.");
  }

  // Determine status
  let status: 'verified' | 'manual_review' | 'rejected' = 'manual_review';
  
  const isRejected = scorer.score < 50 || !scorer.isReceiverVerified || !scorer.isAmountVerified || isDuplicate;
  const isApproved = scorer.isReceiverVerified && scorer.isAmountVerified && scorer.isTxIdFound && scorer.score >= 80 && !isDuplicate;

  if (isRejected) {
    status = 'rejected';
  } else if (isApproved) {
    status = 'verified';
  } else {
    status = 'manual_review';
  }

  return {
    status,
    score: scorer.score,
    extracted,
    rejectionReasons: scorer.rejectionReasons,
    breakdown: scorer.breakdown
  };
};
