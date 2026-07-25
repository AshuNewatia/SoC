import {
    generateTaskStatusChart,
    generatePriorityChart,
    generateCompletionTrendChart,
} from './chartService.js';
import { drawSectionTitle, drawCard, COLORS } from './pdfHelpers.js';

export default async function drawTaskAnalytics(doc, report) {
    const margin = doc.page.margins.left;
    const pageWidth = doc.page.width;
    const contentWidth = pageWidth - margin * 2;

    drawSectionTitle(doc, 'Task Analytics');

    doc.fillColor(COLORS.secondary)
       .fontSize(11)
       .font('Helvetica')
       .text('Task distribution, priorities and completion trends.', margin, doc.y - 10);

    doc.moveDown(1);

    try {
        const [statusBuffer, priorityBuffer, trendBuffer] = await Promise.all([
            generateTaskStatusChart(report).catch(() => null),
            generatePriorityChart(report).catch(() => null),
            generateCompletionTrendChart(report).catch(() => null),
        ]);

        let y = doc.y + 20;

        const gap = 20;
        const cardWidth = (contentWidth - gap) / 2;
        const cardHeight = 220;

        const card1 = drawCard(doc, margin, y, cardWidth, cardHeight, {
            title: 'Task Status',
            backgroundColor: COLORS.white,
            borderColor: COLORS.border,
            radius: 8,
            padding: 15,
        });

        if (statusBuffer) {
            try {
                doc.image(statusBuffer, card1.innerX, card1.innerY, {
                    width: card1.innerWidth,
                    height: card1.innerHeight,
                    fit: [card1.innerWidth, card1.innerHeight],
                });
            } catch {
                renderFallbackText(doc, card1.innerX, card1.innerY, card1.innerWidth, 'Chart unavailable');
            }
        } else {
            renderFallbackText(doc, card1.innerX, card1.innerY, card1.innerWidth, 'No data available');
        }

        const card2 = drawCard(doc, margin + cardWidth + gap, y, cardWidth, cardHeight, {
            title: 'Priority Distribution',
            backgroundColor: COLORS.white,
            borderColor: COLORS.border,
            radius: 8,
            padding: 15,
        });

        if (priorityBuffer) {
            try {
                doc.image(priorityBuffer, card2.innerX, card2.innerY, {
                    width: card2.innerWidth,
                    height: card2.innerHeight,
                    fit: [card2.innerWidth, card2.innerHeight],
                });
            } catch {
                renderFallbackText(doc, card2.innerX, card2.innerY, card2.innerWidth, 'Chart unavailable');
            }
        } else {
            renderFallbackText(doc, card2.innerX, card2.innerY, card2.innerWidth, 'No data available');
        }

        y = y + cardHeight + 30;
        const trendCardHeight = 240;
        const trendCard = drawCard(doc, margin, y, contentWidth, trendCardHeight, {
            title: 'Completion Trend',
            backgroundColor: COLORS.white,
            borderColor: COLORS.border,
            radius: 8,
            padding: 15,
        });

        if (trendBuffer) {
            try {
                doc.image(trendBuffer, trendCard.innerX, trendCard.innerY, {
                    width: trendCard.innerWidth,
                    height: trendCard.innerHeight,
                    fit: [trendCard.innerWidth, trendCard.innerHeight],
                });
            } catch {
                renderFallbackText(doc, trendCard.innerX, trendCard.innerY, trendCard.innerWidth, 'Chart unavailable');
            }
        } else {
            renderFallbackText(doc, trendCard.innerX, trendCard.innerY, trendCard.innerWidth, 'No data available');
        }
    } catch (error) {
        doc.fillColor(COLORS.red)
           .fontSize(14)
           .text('Error loading charts: ' + error.message, margin, doc.y + 50);
    }
}

function renderFallbackText(doc, x, y, width, message) {
    doc.fillColor(COLORS.secondary)
       .fontSize(12)
       .text(message, x, y + 80, {
           width: width,
           align: 'center',
       });
}