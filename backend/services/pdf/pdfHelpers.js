export const COLORS = {
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

export function drawSectionTitle(doc, title) {
    doc.moveDown(1.5)
       .font("Helvetica-Bold")
       .fontSize(18)
       .fillColor(COLORS.primary)
       .text(title);

    doc.moveDown(0.4);

    doc.strokeColor(COLORS.border)
       .lineWidth(1)
       .moveTo(doc.page.margins.left, doc.y)
       .lineTo(doc.page.width - doc.page.margins.right, doc.y)
       .stroke();

    doc.moveDown();
}

export function drawField(doc, x, y, label, value) {
    doc.font("Helvetica")
       .fontSize(10)
       .fillColor(COLORS.secondary)
       .text(label, x, y);

    doc.font("Helvetica-Bold")
       .fontSize(13)
       .fillColor(COLORS.text)
       .text(value ?? "-", x, y + 15);
}

export function drawCard(doc, x, y, width, height, options = {}) {
    const {
        title = null,
        backgroundColor = COLORS.white,
        borderColor = COLORS.border,
        borderWidth = 1,
        radius = 8,
        padding = 15,
        titleFontSize = 14,
        titleColor = COLORS.primary,
    } = options;

    doc.save()
       .roundedRect(x, y, width, height, radius)
       .fillAndStroke(backgroundColor, borderColor, borderWidth)
       .restore();

    let innerY = y + padding;
    let innerX = x + padding;
    let innerWidth = width - 2 * padding;
    let innerHeight = height - 2 * padding;

    if (title) {
        doc.fontSize(titleFontSize)
           .font('Helvetica-Bold')
           .fillColor(titleColor)
           .text(title, innerX, innerY, { width: innerWidth, align: 'left' });
        
        const titleHeight = doc.heightOfString(title, { width: innerWidth });
        innerY += titleHeight + 10;
        innerHeight -= titleHeight + 10;
    }

    return { innerX, innerY, innerWidth, innerHeight };
}

export function drawProgressBar(doc, x, y, width, progress) {
    const height = 8;
    const clampedProgress = Math.min(Math.max(progress, 0), 1);

    doc.roundedRect(x, y, width, height, 4)
       .fill(COLORS.border);

    if (clampedProgress > 0) {
        doc.roundedRect(x, y, width * clampedProgress, height, 4)
           .fill(COLORS.primary);
    }
}

export function drawInfoBox(doc, x, y, width, height, title, value) {
    doc.roundedRect(x, y, width, height, 8)
       .fillAndStroke(COLORS.white, COLORS.border);

    doc.fontSize(10)
       .fillColor(COLORS.secondary)
       .text(title, x + 12, y + 10);

    doc.font("Helvetica-Bold")
       .fontSize(13)
       .fillColor(COLORS.text)
       .text(value, x + 12, y + 28);
}