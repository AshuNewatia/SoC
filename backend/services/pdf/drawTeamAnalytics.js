import { drawSectionTitle, drawCard, drawProgressBar, COLORS } from './pdfHelpers.js';

export default function drawTeamAnalytics(doc, report) {
    const margin = doc.page.margins.left;
    const pageWidth = doc.page.width;
    const contentWidth = pageWidth - margin * 2;

    drawSectionTitle(doc, 'Team Analytics');

    doc.fillColor(COLORS.secondary)
       .fontSize(11)
       .font('Helvetica')
       .text('Member productivity and workload analysis.', margin, doc.y - 10);

    doc.moveDown(1);

    const memberPerformance = report?.memberPerformance || [];
    const workload = report?.workload || [];

    let y = doc.y + 10;

    const cardWidth = (contentWidth - 20) / 2;
    const cardHeight = 300;

    const card1 = drawCard(doc, margin, y, cardWidth, cardHeight, {
        title: 'Member Performance',
        backgroundColor: COLORS.white,
        borderColor: COLORS.border,
        radius: 8,
        padding: 15,
        titleColor: COLORS.primary,
    });

    renderMemberPerformance(doc, card1.innerX, card1.innerY, card1.innerWidth, card1.innerHeight, memberPerformance);

    const card2 = drawCard(doc, margin + cardWidth + 20, y, cardWidth, cardHeight, {
        title: 'Workload Distribution',
        backgroundColor: COLORS.white,
        borderColor: COLORS.border,
        radius: 8,
        padding: 15,
        titleColor: COLORS.primary,
    });

    renderWorkloadDistribution(doc, card2.innerX, card2.innerY, card2.innerWidth, card2.innerHeight, workload);
}

function renderMemberPerformance(doc, x, y, width, height, members) {
    if (!members || members.length === 0) {
        doc.fillColor(COLORS.secondary)
           .fontSize(11)
           .text('No member data available', x, y + 20, { 
               width, 
               align: 'center' 
           });
        return;
    }

    const itemsToShow = members.slice(0, 5);
    const hasMore = members.length > 5;

    let currentY = y;
    const itemHeight = 50;

    itemsToShow.forEach((member, index) => {
        const itemY = currentY + index * itemHeight;

        if (index > 0) {
            doc.strokeColor(COLORS.border)
               .lineWidth(0.5)
               .moveTo(x, itemY - 2)
               .lineTo(x + width, itemY - 2)
               .stroke();
        }

        doc.fillColor(COLORS.text)
           .fontSize(10)
           .font('Helvetica-Bold')
           .text(member.name || 'Unknown', x, itemY);

        const stats = `Assigned: ${member.assigned || 0}  |  Completed: ${member.completed || 0}  |  Overdue: ${member.overdue || 0}`;
        doc.fillColor(COLORS.secondary)
           .fontSize(8)
           .font('Helvetica')
           .text(stats, x, itemY + 13);

        const progress = Math.min((member.completion || 0) / 100, 1);
        drawProgressBar(doc, x, itemY + 26, width - 40, progress);

        doc.fillColor(COLORS.primary)
           .fontSize(9)
           .font('Helvetica-Bold')
           .text(`${Math.round(member.completion || 0)}%`, x + width - 35, itemY + 26, { 
               width: 35, 
               align: 'right' 
           });
    });

    if (hasMore) {
        doc.fillColor(COLORS.secondary)
           .fontSize(9)
           .text(`+ ${members.length - 5} more members`, x, currentY + itemsToShow.length * itemHeight, {
               width,
               align: 'right',
           });
    }
}

function renderWorkloadDistribution(doc, x, y, width, height, workload) {
    if (!workload || workload.length === 0) {
        doc.fillColor(COLORS.secondary)
           .fontSize(11)
           .text('No workload data available', x, y + 20, { 
               width, 
               align: 'center' 
           });
        return;
    }

    const itemsToShow = workload.slice(0, 6);
    const hasMore = workload.length > 6;
    const maxTasks = Math.max(...itemsToShow.map(w => w.activeTasks || 0), 1);

    let currentY = y;
    const barHeight = 25;
    const gap = 10;

    itemsToShow.forEach((member, index) => {
        const itemY = currentY + index * (barHeight + gap);

        if (index > 0) {
            doc.strokeColor(COLORS.border)
               .lineWidth(0.5)
               .moveTo(x, itemY - 2)
               .lineTo(x + width, itemY - 2)
               .stroke();
        }

        doc.fillColor(COLORS.text)
           .fontSize(9)
           .font('Helvetica-Bold')
           .text(member.name || 'Unknown', x, itemY);

        const barWidth = width - 60;
        const fillWidth = ((member.activeTasks || 0) / maxTasks) * barWidth;

        doc.roundedRect(x, itemY + 13, barWidth, 8, 4)
           .fill(COLORS.border);

        if (fillWidth > 0) {
            doc.roundedRect(x, itemY + 13, fillWidth, 8, 4)
               .fill(COLORS.primary);
        }

        doc.fillColor(COLORS.secondary)
           .fontSize(9)
           .font('Helvetica')
           .text(`${member.activeTasks || 0} tasks`, x + barWidth + 8, itemY, {
               width: 50,
               align: 'left',
           });
    });

    if (hasMore) {
        doc.fillColor(COLORS.secondary)
           .fontSize(9)
           .text(`+ ${workload.length - 6} more`, x, currentY + itemsToShow.length * (barHeight + gap), {
               width,
               align: 'right',
           });
    }
}