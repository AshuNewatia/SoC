import { drawSectionTitle, drawCard, COLORS } from './pdfHelpers.js';

export default function drawDeadlineAnalytics(doc, report) {
    const margin = doc.page.margins.left;
    const pageWidth = doc.page.width;
    const contentWidth = pageWidth - margin * 2;

    drawSectionTitle(doc, 'Deadline Analytics');

    doc.fillColor(COLORS.secondary)
       .fontSize(11)
       .font('Helvetica')
       .text('Upcoming and overdue task overview.', margin, doc.y - 10);

    doc.moveDown(1);

    const deadlines = report?.deadlines || { overdue: [], upcoming: [] };
    const overdue = deadlines.overdue || [];
    const upcoming = deadlines.upcoming || [];

    let y = doc.y + 20;

    const gap = 20;
    const cardWidth = (contentWidth - gap) / 2;
    const cardHeight = 320;

    const card1 = drawCard(doc, margin, y, cardWidth, cardHeight, {
        title: 'Upcoming Deadlines',
        backgroundColor: COLORS.white,
        borderColor: COLORS.border,
        radius: 8,
        padding: 15,
        titleColor: COLORS.primary,
    });

    renderTaskList(doc, card1.innerX, card1.innerY, card1.innerWidth, card1.innerHeight, upcoming, 'upcoming');

    const card2 = drawCard(doc, margin + cardWidth + gap, y, cardWidth, cardHeight, {
        title: 'Overdue Tasks',
        backgroundColor: COLORS.white,
        borderColor: COLORS.border,
        radius: 8,
        padding: 15,
        titleColor: COLORS.red,
    });

    renderTaskList(doc, card2.innerX, card2.innerY, card2.innerWidth, card2.innerHeight, overdue, 'overdue');
}

function renderTaskList(doc, x, y, width, height, tasks, type) {
    const maxItems = 5;
    const itemsToShow = tasks.slice(0, maxItems);
    const hasMore = tasks.length > maxItems;

    let currentY = y;
    const lineHeight = 32;
    const maxLines = Math.floor(height / lineHeight);

    if (itemsToShow.length === 0) {
        doc.fillColor(COLORS.secondary)
           .fontSize(11)
           .text('No tasks', x, currentY + 20, {
               width,
               align: 'center',
           });
        return;
    }

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'Critical': return COLORS.red;
            case 'High': return COLORS.amber;
            case 'Medium': return COLORS.blue;
            case 'Low': return COLORS.green;
            default: return COLORS.secondary;
        }
    };

    for (let i = 0; i < Math.min(itemsToShow.length, maxLines); i++) {
        const task = itemsToShow[i];
        const taskY = currentY + i * lineHeight;

        const priorityColor = getPriorityColor(task.priority);
        doc.circle(x + 6, taskY + 6, 4)
           .fill(priorityColor);

        let title = task.title || 'Untitled';
        if (title.length > 28) title = title.substring(0, 25) + '...';
        doc.fillColor(COLORS.text)
           .fontSize(10)
           .font('Helvetica-Bold')
           .text(title, x + 16, taskY, {
               width: width - 90,
               ellipsis: true,
           });

        const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date';
        doc.fillColor(COLORS.secondary)
           .fontSize(8)
           .font('Helvetica')
           .text(dueDate, x + width - 70, taskY, {
               width: 65,
               align: 'right',
           });

        if (task.assignedTo && task.assignedTo.name) {
            const assignee = task.assignedTo.name;
            const displayName = assignee.length > 15 ? assignee.substring(0, 12) + '...' : assignee;
            doc.fillColor(COLORS.secondary)
               .fontSize(8)
               .font('Helvetica')
               .text('👤 ' + displayName, x + 16, taskY + 14, {
                   width: width - 90,
               });
        }

        if (i < itemsToShow.length - 1) {
            doc.strokeColor(COLORS.border)
               .lineWidth(0.5)
               .moveTo(x, taskY + lineHeight - 2)
               .lineTo(x + width, taskY + lineHeight - 2)
               .stroke();
        }
    }

    if (hasMore && itemsToShow.length < maxLines) {
        doc.fillColor(COLORS.secondary)
           .fontSize(9)
           .font('Helvetica')
           .text(`+ ${tasks.length - itemsToShow.length} more`, x, currentY + itemsToShow.length * lineHeight, {
               width,
               align: 'right',
           });
    }
}