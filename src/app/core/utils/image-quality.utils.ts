/**
 * Image Quality Assessment Utilities
 *
 * ฟังก์ชันสำหรับประเมินคุณภาพของภาพก่อนส่งไปยัง AI
 * - calculateBrightness: คำนวณความสว่างของภาพ
 * - calculateLaplacian: คำนวณความชัดของภาพ (Blur Detection)
 *
 * @author Intelligent Video Analytics Platform
 * @version 1.0.0
 */

/**
 * คำนวณความสว่างเฉลี่ยของภาพ
 * @param imageData - ข้อมูลภาพจาก Canvas ImageData
 * @returns ค่าความสว่างเฉลี่ย (0-255)
 */
export function calculateBrightness(imageData: ImageData): number {
  const data = imageData.data;
  let brightness = 0;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Calculate luminance using standard formula
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
    brightness += luminance;
  }

  return brightness / (data.length / 4);
}

/**
 * คำนวณความชัดของภาพโดยใช้ Laplacian Operator
 * @param imageData - ข้อมูลภาพจาก Canvas ImageData
 * @returns ค่าความชัด (ยิ่งสูงยิ่งชัด)
 */
export function calculateLaplacian(imageData: ImageData): number {
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;
  let laplacian = 0;

  // Convert to grayscale first
  const gray = new Uint8Array(width * height);
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    gray[i / 4] = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
  }

  // Apply Laplacian kernel
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      const center = gray[idx];
      const top = gray[idx - width];
      const bottom = gray[idx + width];
      const left = gray[idx - 1];
      const right = gray[idx + 1];

      const laplacianValue = Math.abs(4 * center - top - bottom - left - right);
      laplacian += laplacianValue;
    }
  }

  return laplacian / ((width - 2) * (height - 2));
}

/**
 * ประเมินคุณภาพภาพโดยรวม
 * @param imageData - ข้อมูลภาพจาก Canvas ImageData
 * @returns ข้อมูลคุณภาพภาพ
 */
export interface ImageQualityAssessment {
  brightness: number;
  blurriness: number;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  feedback: string;
  recommendations: string[];
}

export function assessImageQuality(imageData: ImageData): ImageQualityAssessment {
  const brightness = calculateBrightness(imageData);
  const blurriness = calculateLaplacian(imageData);

  let quality: 'excellent' | 'good' | 'fair' | 'poor' = 'poor';
  let feedback = '';
  const recommendations: string[] = [];

  // Assess brightness
  if (brightness < 80) {
    feedback += 'ภาพมืดเกินไป ';
    recommendations.push('ย้ายไปที่ที่มีแสงสว่างมากขึ้น');
  } else if (brightness > 180) {
    feedback += 'ภาพสว่างเกินไป ';
    recommendations.push('ย้ายไปที่ที่มีแสงน้อยลง');
  } else {
    feedback += 'ความสว่างเหมาะสม ';
  }

  // Assess blurriness
  if (blurriness < 50) {
    feedback += 'ภาพเบลอ ';
    recommendations.push('ถือกล้องให้นิ่ง หรือใช้ขาตั้งกล้อง');
  } else if (blurriness > 200) {
    feedback += 'ภาพชัดมาก ';
  } else {
    feedback += 'ความชัดเหมาะสม ';
  }

  // Overall quality assessment
  if (brightness >= 80 && brightness <= 180 && blurriness >= 50) {
    quality = 'excellent';
  } else if (brightness >= 70 && brightness <= 190 && blurriness >= 40) {
    quality = 'good';
  } else if (brightness >= 60 && brightness <= 200 && blurriness >= 30) {
    quality = 'fair';
  } else {
    quality = 'poor';
  }

  return {
    brightness,
    blurriness,
    quality,
    feedback: feedback.trim(),
    recommendations
  };
}

/**
 * ตรวจสอบว่าภาพมีคุณภาพเพียงพอสำหรับ Face Recognition หรือไม่
 * @param imageData - ข้อมูลภาพจาก Canvas ImageData
 * @returns true ถ้าภาพมีคุณภาพเพียงพอ
 */
export function isImageQualitySufficient(imageData: ImageData): boolean {
  const assessment = assessImageQuality(imageData);
  return assessment.quality === 'excellent' || assessment.quality === 'good';
}

/**
 * ตรวจสอบว่าภาพมีคุณภาพเพียงพอสำหรับ Group Recognition หรือไม่
 * @param imageData - ข้อมูลภาพจาก Canvas ImageData
 * @returns true ถ้าภาพมีคุณภาพเพียงพอ
 */
export function isImageQualitySufficientForGroup(imageData: ImageData): boolean {
  const assessment = assessImageQuality(imageData);
  return assessment.quality === 'excellent';
}
