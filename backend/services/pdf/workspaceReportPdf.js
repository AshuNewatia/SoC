import PDFDocument from "pdfkit";
import drawCover from "./drawCover.js";
import drawTaskAnalytics from "./drawTaskAnalytics.js";
import drawDeadlineAnalytics from "./drawDeadlineAnalytics.js";
import drawTeamAnalytics from "./drawTeamAnalytics.js";
import drawGithubAnalytics from "./drawGithubAnalytics.js";

export const generateWorkspaceReportPDF = async (doc, report) => {
    const hasGithub = report.githubAnalytics?.repository;
    
    drawCover(doc, report);

    doc.addPage();
    await drawTaskAnalytics(doc, report);

    doc.addPage();
    drawDeadlineAnalytics(doc, report);

    doc.addPage();
    drawTeamAnalytics(doc, report);

    if (hasGithub) {
        doc.addPage();
        drawGithubAnalytics(doc, report);
    }

    return doc;
};