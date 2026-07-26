import { drawSectionTitle, drawCard, COLORS } from './pdfHelpers.js';

export default function drawGithubAnalytics(doc, report) {
    const margin = doc.page.margins.left;
    const pageWidth = doc.page.width;
    const contentWidth = pageWidth - margin * 2;

    drawSectionTitle(doc, 'GitHub Analytics');

    doc.fillColor(COLORS.secondary)
       .fontSize(11)
       .font('Helvetica')
       .text('Repository activity and pull request health.', margin, doc.y - 10);

    doc.moveDown(1);

    const github = report?.githubAnalytics || {};
    
    if (!github.repository) {
        drawNoGithubData(doc, margin, contentWidth);
        return;
    }

    let y = doc.y + 20;

    const repoCardHeight = 90;
    const repoCard = drawCard(doc, margin, y, contentWidth, repoCardHeight, {
        title: github.repository || 'Repository',
        backgroundColor: COLORS.light,
        borderColor: COLORS.border,
        radius: 8,
        padding: 15,
        titleColor: COLORS.primary,
        titleFontSize: 14,
    });

    const stats = [
        { label: 'Total Commits', value: github.totalCommits || 0 },
        { label: 'Open PRs', value: github.openPRs || 0 },
        { label: 'Closed PRs', value: github.closedPRs || 0 },
        { label: 'Total PRs', value: github.totalPRs || 0 },
    ];

    const statWidth = repoCard.innerWidth / stats.length;
    const statY = repoCard.innerY;

    stats.forEach((stat, index) => {
        const statX = repoCard.innerX + index * statWidth;
        
        doc.fillColor(COLORS.primary)
           .fontSize(20)
           .font('Helvetica-Bold')
           .text(stat.value.toString(), statX, statY + 5, {
               width: statWidth,
               align: 'center',
           });

        doc.fillColor(COLORS.secondary)
           .fontSize(9)
           .font('Helvetica')
           .text(stat.label, statX, statY + 35, {
               width: statWidth,
               align: 'center',
           });

        if (index < stats.length - 1) {
            doc.strokeColor(COLORS.border)
               .lineWidth(0.5)
               .moveTo(statX + statWidth, statY)
               .lineTo(statX + statWidth, statY + 55)
               .stroke();
        }
    });

    y = y + repoCardHeight + 25;

    const cardWidth = (contentWidth - 20) / 2;
    const cardHeight = 230;

    const card1 = drawCard(doc, margin, y, cardWidth, cardHeight, {
        title: 'Pull Request Health',
        backgroundColor: COLORS.white,
        borderColor: COLORS.border,
        radius: 8,
        padding: 15,
        titleColor: COLORS.primary,
    });

    renderPRHealth(doc, card1.innerX, card1.innerY, card1.innerWidth, card1.innerHeight, github);

    const card2 = drawCard(doc, margin + cardWidth + 20, y, cardWidth, cardHeight, {
        title: 'Repository Activity',
        backgroundColor: COLORS.white,
        borderColor: COLORS.border,
        radius: 8,
        padding: 15,
        titleColor: COLORS.primary,
    });

    renderRepositoryActivity(doc, card2.innerX, card2.innerY, card2.innerWidth, card2.innerHeight, github);
}

function drawNoGithubData(doc, margin, contentWidth) {
    doc.fillColor(COLORS.secondary)
       .fontSize(14)
       .font('Helvetica')
       .text('No GitHub Repository Connected', margin, doc.y + 30, {
           width: contentWidth,
           align: 'center',
       });

    doc.fillColor(COLORS.secondary)
       .fontSize(11)
       .font('Helvetica')
       .text('Connect a GitHub repository to view analytics.', margin, doc.y + 60, {
           width: contentWidth,
           align: 'center',
       });
}

function renderPRHealth(doc, x, y, width, height, github) {
    const totalPRs = github.totalPRs || 0;
    const openPRs = github.openPRs || 0;
    const closedPRs = github.closedPRs || 0;
    const mergeRate = totalPRs > 0 ? (closedPRs / totalPRs) * 100 : 0;

    const healthScore = Math.min(Math.round(mergeRate), 100);

    const circleX = x + width / 2;
    const circleY = y + 35;
    const radius = 45;

    doc.circle(circleX, circleY, radius)
       .fill(COLORS.border);

    const color = healthScore >= 70 ? COLORS.green : healthScore >= 40 ? COLORS.amber : COLORS.red;
    doc.circle(circleX, circleY, radius)
       .fill(color);

    doc.fillColor(COLORS.white)
       .fontSize(28)
       .font('Helvetica-Bold')
       .text(`${healthScore}%`, circleX - 25, circleY - 12, {
           width: 50,
           align: 'center',
       });

    doc.fillColor(COLORS.secondary)
       .fontSize(10)
       .font('Helvetica')
       .text('PR Health Score', circleX - 40, circleY + 50, {
           width: 80,
           align: 'center',
       });

    const statY = circleY + 80;
    const statGap = 50;

    doc.fillColor(COLORS.amber)
       .fontSize(10)
       .font('Helvetica-Bold')
       .text('Open:', x + 20, statY);
    doc.fillColor(COLORS.text)
       .fontSize(12)
       .font('Helvetica-Bold')
       .text(`${openPRs}`, x + 60, statY);

    doc.fillColor(COLORS.green)
       .fontSize(10)
       .font('Helvetica-Bold')
       .text('Closed:', x + 20 + statGap, statY);
    doc.fillColor(COLORS.text)
       .fontSize(12)
       .font('Helvetica-Bold')
       .text(`${closedPRs}`, x + 60 + statGap, statY);
}

function renderRepositoryActivity(doc, x, y, width, height, github) {
    const totalCommits = github.totalCommits || 0;
    const totalPRs = github.totalPRs || 0;

    const activities = [
        { label: 'Total Commits', value: totalCommits },
        { label: 'Total Pull Requests', value: totalPRs },
        { label: 'PR to Commit Ratio', value: totalPRs > 0 ? (totalCommits / totalPRs).toFixed(1) : '0' },
        { label: 'Repository Status', value: github.repository ? 'Active' : 'Inactive' },
    ];

    const itemHeight = 40;
    const startY = y + 10;

    activities.forEach((activity, index) => {
        const itemY = startY + index * itemHeight;

        doc.fillColor(COLORS.secondary)
           .fontSize(9)
           .font('Helvetica')
           .text(activity.label, x + 10, itemY + 2);

        doc.fillColor(COLORS.text)
           .fontSize(16)
           .font('Helvetica-Bold')
           .text(activity.value.toString(), x + 10, itemY + 18);

        if (index < activities.length - 1) {
            doc.strokeColor(COLORS.border)
               .lineWidth(0.5)
               .moveTo(x, itemY + itemHeight - 2)
               .lineTo(x + width, itemY + itemHeight - 2)
               .stroke();
        }
    });

    if (totalCommits === 0 && totalPRs === 0) {
        doc.fillColor(COLORS.secondary)
           .fontSize(12)
           .text('No activity detected', x + 10, y + 40, {
               width: width - 20,
               align: 'center',
           });
    }
}