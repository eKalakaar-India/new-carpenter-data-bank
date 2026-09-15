/**
 * Report Generation Utility
 * Generates Excel, Word, and PDF reports for batch data
 */

import XLSX from 'xlsx';
import PDFDocument from 'pdfkit';
import {StorageService} from '../modules/storage/storage.service.js';
import { Document, Packer, Paragraph, Table, TableCell, TableRow, ImageRun, BorderStyle, VerticalAlign, convertInchesToTwip, TextRun, HeadingLevel } from 'docx';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { logger } from './logger.js';


const storageService = new StorageService();
/**
 * Generates Excel report from batch data
 * @param {Array} batchData - Array of batch records with KPI data
 * @param {string} fy - Financial year for the report
 * @returns {Buffer} Excel file buffer
 */
export async function generateExcelReport(batchData, fy = 'all') {
  try {
    const workbook = XLSX.utils.book_new();

    // Create summary sheet
    const summaryData = [
      ['Batch-wise Report Summary'],
      [],
      ['Financial Year', fy === 'all' ? 'All Years' : fy],
      ['Report Generated', new Date().toLocaleDateString('en-IN')],
      ['Total Batches', batchData.length],
      ['Total Trainees', batchData.reduce((sum, b) => sum + (b['Number of Trainees'] || 0), 0)],
      ['Total Trained', batchData.reduce((sum, b) => sum + (b['Number Trained'] || 0), 0)],
      [],
    ];

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    summarySheet['!cols'] = [{ wch: 30 }, { wch: 30 }];
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

    // Create detailed data sheet
    const worksheet = XLSX.utils.json_to_sheet(batchData);
    
    // Set column widths
    worksheet['!cols'] = [
      { wch: 15 }, // Batch No
      { wch: 12 }, // State
      { wch: 12 }, // District
      { wch: 25 }, // Training Location
      { wch: 15 }, // Type of Centre
      { wch: 12 }, // Training Date
      { wch: 15 }, // Month
      { wch: 12 }, // Number of Trainees
      { wch: 12 }, // Number Trained
      { wch: 10 }, // Insurance
      { wch: 10 }, // Certificate
      { wch: 35 }, // Training Details/Remarks
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Batches');

    // Return buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    return buffer;
  } catch (error) {
    logger.error('Excel report generation failed:', error);
    throw new Error(`Excel report generation failed: ${error.message}`);
  }
}

/**
 * Generates Word document report from detailed batch data
 * @param {Array} batchesData - Array of detailed batch records
 * @param {string} fy - Financial year for the report
 * @returns {Promise<Buffer>} Word document buffer
 */
export async function generateWordReport(batchesData, fy = 'all') {
  try {
    const sections = [];

    // Add title
    sections.push(
      new Paragraph({
        text: 'Batch-wise Training Report',
        heading: HeadingLevel.HEADING_1,
        bold: true,
        spacing: { after: 100 },
      })
    );

    sections.push(
      new Paragraph({
        text: `Financial Year: ${fy === 'all' ? 'All Years' : fy}`,
        spacing: { after: 100 },
      })
    );

    sections.push(
      new Paragraph({
        text: `Report Generated: ${new Date().toLocaleDateString('en-IN')}`,
        spacing: { after: 400 },
      })
    );

    sections.push(
      new Paragraph({
        text: `Total Completed Batches: ${batchesData.length}`,
        spacing: { after: 400 },
      })
    );

    // 2. REPLACED batchesData.forEach WITH FOR-LOOP TO ALLOW ASYNC/AWAIT
    for (let index = 0; index < batchesData.length; index++) {
      const batch = batchesData[index];

      sections.push(
        new Paragraph({
          text: `Batch ${index + 1}: ${batch.batchId}`,
          heading: HeadingLevel.HEADING_2,
          bold: true,
          spacing: { before: 200, after: 100 },
        })
      );

      // Batch details table
      const detailsTableRows = [
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph('Field')], shading: { fill: 'D3D3D3' } }),
            new TableCell({ children: [new Paragraph('Value')], shading: { fill: 'D3D3D3' } }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph('State')] }),
            new TableCell({ children: [new Paragraph(batch.state || '')] }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph('District')] }),
            new TableCell({ children: [new Paragraph(batch.district || '')] }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph('Training Location')] }),
            new TableCell({ children: [new Paragraph(batch.trainingLocation || '')] }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph('Type of Centre')] }),
            new TableCell({ children: [new Paragraph(batch.typeCentre || '')] }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph('Training Date')] }),
            new TableCell({ children: [new Paragraph(batch.trainingDate || '')] }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph('Trainer Name')] }),
            new TableCell({ children: [new Paragraph(batch.trainerName || '')] }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph('Trainer Phone')] }),
            new TableCell({ children: [new Paragraph(batch.trainerPhone || '')] }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph('Mobiliser')] }),
            new TableCell({ children: [new Paragraph(batch.mobiliser || '')] }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph('Total Trainees')] }),
            new TableCell({ children: [new Paragraph(batch.totalTrainees ? batch.totalTrainees.toString() : '0')] }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph('Number Trained')] }),
            new TableCell({ children: [new Paragraph(batch.numberTrained ? batch.numberTrained.toString() : '0')] }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph('Insurance Count')] }),
            new TableCell({ children: [new Paragraph(batch.insuranceCount ? batch.insuranceCount.toString() : '0')] }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph('Certificate Count')] }),
            new TableCell({ children: [new Paragraph(batch.certificateCount ? batch.certificateCount.toString() : '0')] }),
          ],
        }),
      ];

      sections.push(
        new Table({
          width: { size: 100, type: 'pct' },
          rows: detailsTableRows,
        })
      );

      // Participants table
      if (batch.participantList && batch.participantList.length > 0) {
        sections.push(
          new Paragraph({
            text: 'Participants',
            heading: HeadingLevel.HEADING_3,
            bold: true,
            spacing: { before: 200, after: 100 },
          })
        );

        const participantRows = [
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph('Sr. No.')], shading: { fill: 'D3D3D3' } }),
              new TableCell({ children: [new Paragraph('Name')], shading: { fill: 'D3D3D3' } }),
              new TableCell({ children: [new Paragraph('Trained')], shading: { fill: 'D3D3D3' } }),
            ],
          }),
          ...batch.participantList.map(
            (p) =>
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph(p.srNo ? p.srNo.toString() : '')] }),
                  new TableCell({ children: [new Paragraph(p.name || '')] }),
                  new TableCell({ children: [new Paragraph(p.trained || '')] }),
                ],
              })
          ),
        ];

        sections.push(
          new Table({
            width: { size: 100, type: 'pct' },
            rows: participantRows,
          })
        );
      }

      // Photos section
      if (batch.photos && batch.photos.length > 0) {
        sections.push(
          new Paragraph({
            text: `Photos (${batch.photos.length} available)`,
            heading: HeadingLevel.HEADING_3,
            bold: true,
            spacing: { before: 200, after: 100 },
          })
        );

        for (let idx = 0; idx < batch.photos.length; idx++) {
          const photoUrl = batch.photos[idx];
          try {
            // 1. Get signed URL
            const url = await storageService.getSignedUrl(photoUrl);

            // 2. Fetch and convert WebP to PNG buffer
            const imageBuffer = await fetchImageBuffer(url);

            // 3. Add image to document
            sections.push(
              new Paragraph({
                children: [
                  new ImageRun({
                    data: imageBuffer,
                    transformation: {
                      width: 300,
                      height: 200,
                    },
                  }),
                ],
                spacing: { after: 100 },
              })
            );
          } catch (imgError) {
            logger.warn(`Failed to process photo ${photoUrl}:`, imgError);
          }
        }
      }

      sections.push(
        new Paragraph({
          text: '',
          spacing: { after: 400 },
        })
      );
    }

    // Create document
    const doc = new Document({
      sections: [
        {
          children: sections,
        },
      ],
    });

    // Generate buffer
    const buffer = await Packer.toBuffer(doc);
    return buffer;
  } catch (error) {
    logger.error('Word report generation failed:', error);
    throw new Error(`Word report generation failed: ${error.message}`);
  }
}

// export async function generatePDFReport(batchesData, fy = 'all') {
//   return new Promise((resolve, reject) => {
//     try {
//       const doc = new PDFDocument();
//       const buffers = [];

//       doc.on('data', (chunk) => buffers.push(chunk));
//       doc.on('end', () => resolve(Buffer.concat(buffers)));
//       doc.on('error', (err) => reject(err));

//       // Title
//       doc.fontSize(24).font('Helvetica-Bold').text('Batch-wise Training Report', { align: 'center' });
//       doc.moveDown();

//       // Report info
//       doc.fontSize(12).font('Helvetica');
//       doc.text(`Financial Year: ${fy === 'all' ? 'All Years' : fy}`);
//       doc.text(`Report Generated: ${new Date().toLocaleDateString('en-IN')}`);
//       doc.text(`Total Completed Batches: ${batchesData.length}`);
//       doc.moveDown();

//       // Batch details
//       batchesData.forEach((batch, index) => {
//         if (doc.y > 750) doc.addPage(); // Add new page if needed

//         doc.fontSize(14).font('Helvetica-Bold').text(`Batch ${index + 1}: ${batch.batchId}`, { underline: true });
//         doc.moveDown(0.5);

//         doc.fontSize(10).font('Helvetica');
//         doc.text(`State: ${batch.state}`);
//         doc.text(`District: ${batch.district}`);
//         doc.text(`Training Location: ${batch.trainingLocation}`);
//         doc.text(`Type of Centre: ${batch.typeCentre}`);
//         doc.text(`Training Date: ${batch.trainingDate}`);
//         doc.text(`Trainer: ${batch.trainerName} (${batch.trainerPhone})`);
//         doc.text(`Mobiliser: ${batch.mobiliser}`);
//         doc.text(`Total Trainees: ${batch.totalTrainees}`);
//         doc.text(`Number Trained: ${batch.numberTrained}`);
//         doc.text(`Insurance: ${batch.insuranceCount}`);
//         doc.text(`Certificates: ${batch.certificateCount}`);

//         if (batch.photos && batch.photos.length > 0) {
//           doc.moveDown(0.5);
//           doc.font('Helvetica-Bold').text(`Photos: ${batch.photos.length} available`);
//           batch.photos.forEach((url, idx) => {
//             if (doc.y > 750) doc.addPage();
//             doc.font('Helvetica').fontSize(9).text(`  ${idx + 1}. ${url}`);
//           });
//         }

//         if (batch.participantList && batch.participantList.length > 0) {
//           if (doc.y > 700) doc.addPage();
//           doc.moveDown(0.5);
//           doc.font('Helvetica-Bold').fontSize(10).text('Participants:');

//           batch.participantList.slice(0, 10).forEach((p) => {
//             if (doc.y > 750) doc.addPage();
//             doc.font('Helvetica').fontSize(9).text(`  ${p.srNo}. ${p.name} - ${p.trained}`);
//           });

//           if (batch.participantList.length > 10) {
//             doc.text(`  ... and ${batch.participantList.length - 10} more participants`);
//           }
//         }

//         doc.moveDown(1);
//       });

//       doc.end();
//     } catch (error) {
//       logger.error('PDF report generation failed:', error);
//       reject(new Error(`PDF report generation failed: ${error.message}`));
//     }
//   });
// }

// Helper function to download an image from a signed URL as a Buffer
async function fetchImageBuffer(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  const rawBuffer = Buffer.from(arrayBuffer);
  // Use sharp to convert the image to a format suitable for PDF embedding (e.g., JPEG)
  const optimizedBuffer = await sharp(rawBuffer).jpeg().toBuffer();
  return optimizedBuffer;
}

/**
 * Generates PDF report from detailed batch data
 * @param {Array} batchesData - Array of detailed batch records
 * @param {string} fy - Financial year for the report
 * @returns {Promise<Buffer>} PDF document buffer
 */


export async function generatePDFReport(batchesData, fy = 'all') {
  // 1. Pre-fetch all photo buffers so PDFKit stream rendering stays fast and synchronous
  const batchesWithImageBuffers = await Promise.all(
    batchesData.map(async (batch) => {
      const photoBuffers = [];
      if (batch.photos && batch.photos.length > 0) {
        for (const url of batch.photos) {
          try {
            const signedUrl = await storageService.getSignedUrl(url); // Get signed URL for the image
            const buffer = await fetchImageBuffer(signedUrl);
            photoBuffers.push(buffer);
          } catch (err) {
            console.warn(`Could not load image at ${url}:`, err.message);
          }
        }
      }
      return { ...batch, photoBuffers };
    })
  );

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (err) => reject(err));

      // Title
      doc.fontSize(24).font('Helvetica-Bold').text('Batch-wise Training Report', { align: 'center' });
      doc.moveDown();

      // Report info
      doc.fontSize(12).font('Helvetica');
      doc.text(`Financial Year: ${fy === 'all' ? 'All Years' : fy}`);
      doc.text(`Report Generated: ${new Date().toLocaleDateString('en-IN')}`);
      doc.text(`Total Completed Batches: ${batchesWithImageBuffers.length}`);
      doc.moveDown();

      // Batch details
      batchesWithImageBuffers.forEach((batch, index) => {
        if (doc.y > 700) doc.addPage();

        doc.fontSize(14).font('Helvetica-Bold').text(`Batch ${index + 1}: ${batch.batchId}`, { underline: true });
        doc.moveDown(0.5);

        doc.fontSize(10).font('Helvetica');
        doc.text(`State: ${batch.state}`);
        doc.text(`District: ${batch.district}`);
        doc.text(`Training Location: ${batch.trainingLocation}`);
        doc.text(`Type of Centre: ${batch.typeCentre}`);
        doc.text(`Training Date: ${batch.trainingDate}`);
        doc.text(`Trainer: ${batch.trainerName} (${batch.trainerPhone})`);
        doc.text(`Mobiliser: ${batch.mobiliser}`);
        doc.text(`Total Trainees: ${batch.totalTrainees}`);
        doc.text(`Number Trained: ${batch.numberTrained}`);
        doc.text(`Insurance: ${batch.insuranceCount}`);
        doc.text(`Certificates: ${batch.certificateCount}`);

        // --- RENDER VISUAL IMAGES ---
        if (batch.photoBuffers && batch.photoBuffers.length > 0) {
          doc.moveDown(0.5);
          doc.font('Helvetica-Bold').text(`Photos (${batch.photoBuffers.length}):`);
          doc.moveDown(0.5);

          batch.photoBuffers.forEach((imgBuffer) => {
            // Add a new page if remaining vertical space is under 160 units
            if (doc.y > 650) doc.addPage();

            // Embed image into PDF
            doc.image(imgBuffer, {
              fit: [200, 140], // max width: 200px, max height: 140px (preserves aspect ratio)
              align: 'left',
            });
            doc.moveDown(1);
          });
        }

        // Participants section
        if (batch.participantList && batch.participantList.length > 0) {
          if (doc.y > 700) doc.addPage();
          doc.moveDown(0.5);
          doc.font('Helvetica-Bold').fontSize(10).text('Participants:');

          batch.participantList.slice(0, 10).forEach((p) => {
            if (doc.y > 750) doc.addPage();
            doc.font('Helvetica').fontSize(9).text(`  ${p.srNo}. ${p.name} - ${p.trained}`);
          });

          if (batch.participantList.length > 10) {
            doc.text(`  ... and ${batch.participantList.length - 10} more participants`);
          }
        }

        doc.moveDown(1);
      });

      doc.end();
    } catch (error) {
      reject(new Error(`PDF report generation failed: ${error.message}`));
    }
  });
}

export default {
  generateExcelReport,
  generateWordReport,
  generatePDFReport,
};
