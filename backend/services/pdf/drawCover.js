import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logoPath = path.join(__dirname, "assets", "logo.png");

const COLORS = {
    primary: "#0F4FBF",
    primaryDark: "#0A2E8A",
    primaryLight: "#E0F2FE",
    accent: "#43B8F8",
    text: "#111827",
    secondary: "#6B7280",
    border: "#E5E7EB",
    light: "#F9FAFB",
    white: "#FFFFFF",
    green: "#10B981",
    greenBg: "#ECFDF5",
    red: "#EF4444",
    redBg: "#FEF2F2",
    amber: "#F59E0B",
    amberBg: "#FFFBEB",
    blue: "#3B82F6",
    blueBg: "#EFF6FF",
};

export default function drawCover(doc, report) {
    const pageWidth = doc.page.width;
    const margin = doc.page.margins.left;
    const contentWidth = pageWidth - margin * 2;

    const startY = 45;
    if (fs.existsSync(logoPath)) {
        try {
            doc.image(logoPath, margin, startY, { width: 45 });
        } catch (error) {
            // Logo not found, skip
        }
    }

    doc.fillColor(COLORS.primary)
       .fontSize(24)
       .font("Helvetica-Bold")
       .text("CAMPUSFLOW", margin + 60, startY + 2);

    doc.fillColor(COLORS.secondary)
       .fontSize(14)
       .font("Helvetica")
       .text("Workspace Analytics Report", margin + 60, startY + 30);

    doc.strokeColor(COLORS.border)
       .lineWidth(1)
       .moveTo(margin, 110)
       .lineTo(pageWidth - margin, 110)
       .stroke();

    doc.fillColor(COLORS.primary)
       .font("Helvetica-Bold")
       .fontSize(18)
       .text("Executive Summary", margin, 125);

    let y = 165;

    const leftX = margin;
    const rightX = margin + contentWidth / 2 + 10;

    const drawInfo = (x, y, label, value) => {
        doc.fillColor(COLORS.secondary)
           .fontSize(10)
           .font("Helvetica")
           .text(label, x, y);

        doc.fillColor(COLORS.text)
           .fontSize(13)
           .font("Helvetica-Bold")
           .text(value || "-", x, y + 16);
    };

    drawInfo(leftX, y, "Workspace", report.workspace.name);
    drawInfo(rightX, y, "Owner", report.workspace.owner?.name || "-");

    y += 55;

    drawInfo(leftX, y, "Description", report.workspace.description || "-");
    drawInfo(rightX, y, "Created On", report.workspace.createdAt
        ? new Date(report.workspace.createdAt).toLocaleDateString()
        : "-"
    );

    y += 55;

    drawInfo(leftX, y, "Members", report.workspace.members?.length || 0);
    drawInfo(rightX, y, "Admins", report.workspace.admins?.length || 0);

    y += 55;

    drawInfo(leftX, y, "Report ID", `CF-${Date.now().toString().slice(-8)}`);
    drawInfo(rightX, y, "Generated On", new Date().toLocaleDateString());

    y += 75;

    doc.strokeColor(COLORS.border)
       .moveTo(margin, y)
       .lineTo(pageWidth - margin, y)
       .stroke();

    y += 25;

    const cardWidth = (contentWidth - 30) / 4;
    const cardHeight = 85;
    const gap = 10;

    const cards = [
        { title: "Total Tasks", value: report.kpis?.totalTasks || 0 },
        { title: "Completed", value: report.kpis?.completedTasks || 0 },
        { title: "Pending", value: report.kpis?.pendingTasks || 0 },
        { title: "Overdue", value: report.kpis?.overdueTasks || 0 },
    ];

    cards.forEach((card, index) => {
        const x = margin + index * (cardWidth + gap);

        doc.roundedRect(x, y, cardWidth, cardHeight, 8)
           .fillAndStroke(COLORS.light, COLORS.border);

        doc.fillColor(COLORS.primary)
           .fontSize(24)
           .font("Helvetica-Bold")
           .text(card.value.toString(), x, y + 18, {
               width: cardWidth,
               align: "center",
           });

        doc.fillColor(COLORS.secondary)
           .fontSize(10)
           .font("Helvetica")
           .text(card.title, x, y + 55, {
               width: cardWidth,
               align: "center",
           });
    });

    y += 115;

    const completed = report.kpis?.completedTasks || 0;
    const total = report.kpis?.totalTasks || 1;
    const progress = Math.min(completed / total, 1);
    const completionRate = Math.round(progress * 100);

    doc.fillColor(COLORS.text)
       .fontSize(13)
       .font("Helvetica-Bold")
       .text("Overall Progress", margin, y);

    y += 22;

    const barWidth = contentWidth;
    const barHeight = 14;

    doc.roundedRect(margin, y, barWidth, barHeight, 5)
       .fill(COLORS.border);

    if (progress > 0) {
        doc.roundedRect(margin, y, barWidth * progress, barHeight, 5)
           .fill(COLORS.primary);
    }

    doc.fillColor(COLORS.secondary)
       .fontSize(11)
       .font("Helvetica")
       .text(`${completionRate}%`, margin, y + barHeight + 8, {
           width: barWidth,
           align: "right",
       });

    doc.moveDown(6);
    
    // NOTE: Do NOT call drawFooter here - it's called from workspaceReportPdf.js
}