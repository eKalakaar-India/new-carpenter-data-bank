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
export async function generateExcelReport(batchData, fy = 'all', participantData = []) {
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
      ['Total Participants', participantData.length],
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

    const participantSheet = XLSX.utils.json_to_sheet(participantData);
    participantSheet['!cols'] = [
      { wch: 8 },  // Sr. No
      { wch: 15 }, // Batch No
      { wch: 15 }, // Batch No
      { wch: 28 }, // Participant Name
      { wch: 15 }, // Phone
      { wch: 28 }, // Email
      { wch: 10 }, // Gender
      { wch: 10 }, // Trained
      { wch: 10 }, // Insurance
      { wch: 10 }, // Certificate
      { wch: 14 }, // State
      { wch: 14 }, // District
      { wch: 14 }, // Training Date
    ];

    if (participantData.length > 0) {
      participantSheet['!autofilter'] = { ref: participantSheet['!ref'] };
    }

    XLSX.utils.book_append_sheet(workbook, participantSheet, 'Participants');

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
export async function generateWordReport(batchesData, carpenterData, fy = 'all', kpis = {}) {
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
    sections.push(
      new Paragraph({
        text: `Total Trained : ${kpis.training?.completedTraining || 0}`,
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
            new TableCell({ children: [new Paragraph('Total Trainees')] }),
            new TableCell({ children: [new Paragraph(batch.totalTrainees ? batch.totalTrainees.toString() : '0')] }),
          ],
        })
      ];

      sections.push(
        new Table({
          width: { size: 100, type: 'pct' },
          rows: detailsTableRows,
        })
      );

      // Participants table
      // if (batch.participantList && batch.participantList.length > 0) {
      //   sections.push(
      //     new Paragraph({
      //       text: 'Participants',
      //       heading: HeadingLevel.HEADING_3,
      //       bold: true,
      //       spacing: { before: 200, after: 100 },
      //     })
      //   );

      //   const participantRows = [
      //     new TableRow({
      //       children: [
      //         new TableCell({ children: [new Paragraph('Sr. No.')], shading: { fill: 'D3D3D3' } }),
      //         new TableCell({ children: [new Paragraph('Name')], shading: { fill: 'D3D3D3' } }),
      //         new TableCell({ children: [new Paragraph('Trained')], shading: { fill: 'D3D3D3' } }),
      //       ],
      //     }),
      //     ...batch.participantList.map(
      //       (p) =>
      //         new TableRow({
      //           children: [
      //             new TableCell({ children: [new Paragraph(p.srNo ? p.srNo.toString() : '')] }),
      //             new TableCell({ children: [new Paragraph(p.name || '')] }),
      //             new TableCell({ children: [new Paragraph(p.trained || '')] }),
      //           ],
      //         })
      //     ),
      //   ];

      //   sections.push(
      //     new Table({
      //       width: { size: 100, type: 'pct' },
      //       rows: participantRows,
      //     })
      //   );
      // }

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

    // if (carpenterData && carpenterData.length > 0) {
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
              new TableCell({ children: [new Paragraph('Training Date')], shading: { fill: 'D3D3D3' } }),
              new TableCell({ children: [new Paragraph('Name')], shading: { fill: 'D3D3D3' } }),
              new TableCell({ children: [new Paragraph('State')], shading: { fill: 'D3D3D3' } }),
              new TableCell({ children: [new Paragraph('District')], shading: { fill: 'D3D3D3' } }),
              new TableCell({ children: [new Paragraph('Mobile No.')], shading: { fill: 'D3D3D3' } }),
            ],
          }),
          ...carpenterData.map(
            (p,idx) =>
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph((idx + 1).toString())] }),
                  new TableCell({ children: [new Paragraph(p.created_at ? new Date(p.created_at).toLocaleDateString('en-IN') : '')] }),
                  new TableCell({ children: [new Paragraph(p.full_name || '')] }),
                  new TableCell({ children: [new Paragraph(p.state || '')] }),
                  new TableCell({ children: [new Paragraph(p.district || '')] }),
                  new TableCell({ children: [new Paragraph(p.mobile_no || '')] }),
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
    // }

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


export async function generatePDFReport(batchesData, carpenterData = [], fy = 'all', kpis = {}) {
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

      const margin = 50;
      const contentWidth = doc.page.width - margin * 2;
      const pageBottom = () => doc.page.height - margin;
      const ensureSpace = (height) => {
        if (doc.y + height > pageBottom()) {
          doc.addPage();
          doc.y = margin;
        }
      };
      const displayValue = (value) => (value == null ? '' : String(value));
      const drawTableRow = (cells, widths, isHeader = false) => {
        const padding = 5;
        doc.font(isHeader ? 'Helvetica-Bold' : 'Helvetica').fontSize(9);
        const heights = cells.map((cell, index) =>
          doc.heightOfString(displayValue(cell), {
            width: widths[index] - padding * 2,
          })
        );
        const rowHeight = Math.max(22, ...heights) + padding * 2;
        const rowY = doc.y;

        let x = margin;
        cells.forEach((cell, index) => {
          doc.save();
          doc.rect(x, rowY, widths[index], rowHeight)
            .fillAndStroke(isHeader ? '#D3D3D3' : '#FFFFFF', '#808080');
          doc.restore();
          doc.font(isHeader ? 'Helvetica-Bold' : 'Helvetica')
            .fontSize(9)
            .fillColor('#000000')
            .text(displayValue(cell), x + padding, rowY + padding, {
              width: widths[index] - padding * 2,
            });
          x += widths[index];
        });

        doc.y = rowY + rowHeight;
        return rowHeight;
      };
      const drawTable = (headers, rows, widths) => {
        const drawHeader = () => drawTableRow(headers, widths, true);
        ensureSpace(30);
        drawHeader();

        rows.forEach((row) => {
          doc.font('Helvetica').fontSize(9);
          const rowHeight = Math.max(
            22,
            ...row.map((cell, index) =>
              doc.heightOfString(displayValue(cell), {
                width: widths[index] - 10,
              })
            )
          ) + 10;

          if (doc.y + rowHeight > pageBottom()) {
            doc.addPage();
            doc.y = margin;
            drawHeader();
          }
          drawTableRow(row, widths);
        });
      };
      const sectionHeading = (text) => {
        ensureSpace(30);
        doc.moveDown(0.5);
        doc.font('Helvetica-Bold').fontSize(13).fillColor('#000000').text(text);
        doc.moveDown(0.3);
      };

      doc.fontSize(24).font('Helvetica-Bold').text('Batch-wise Training Report', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).font('Helvetica');
      doc.text(`Financial Year: ${fy === 'all' ? 'All Years' : fy}`);
      doc.text(`Report Generated: ${new Date().toLocaleDateString('en-IN')}`);
      doc.text(`Total Completed Batches: ${batchesWithImageBuffers.length}`);
      doc.text(`Total Trained : ${kpis.training?.completedTraining || 0}`);
      doc.moveDown();

      batchesWithImageBuffers.forEach((batch, index) => {
        ensureSpace(40);
        doc.fontSize(14).font('Helvetica-Bold').text(`Batch ${index + 1}: ${batch.batchId}`);
        doc.moveDown(0.4);

        drawTable(
          ['Field', 'Value'],
          [
            ['State', batch.state || ''],
            ['District', batch.district || ''],
            ['Training Location', batch.trainingLocation || ''],
            ['Type of Centre', batch.typeCentre || ''],
            ['Training Date', batch.trainingDate || ''],
            ['Trainer Name', batch.trainerName || ''],
            ['Total Trainees', batch.totalTrainees ? String(batch.totalTrainees) : '0'],
          ],
          [contentWidth * 0.35, contentWidth * 0.65]
        );

        if (batch.photos && batch.photos.length > 0) {
          sectionHeading(`Photos (${batch.photos.length} available)`);
          batch.photoBuffers.forEach((imageBuffer) => {
            ensureSpace(210);
            doc.image(imageBuffer, margin, doc.y, { fit: [300, 200] });
            doc.y += 210;
          });
        }
        doc.moveDown();
      });

      sectionHeading('Participants');
      drawTable(
        ['Sr. No.', 'Name', 'State', 'District', 'Mobile No.'],
        carpenterData.map((participant, index) => [
          String(index + 1),
          participant.full_name || '',
          participant.state || '',
          participant.district || '',
          participant.mobile_no || '',
        ]),
        [contentWidth * 0.1, contentWidth * 0.28, contentWidth * 0.19, contentWidth * 0.2, contentWidth * 0.23]
      );

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
