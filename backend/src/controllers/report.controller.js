import * as reportService from '../services/report.service.js';

export const downloadJSON = async (req, res, next) => {
    try {
        const data = await reportService.generateJSON(req.params.testId, req.user._id);
        res.setHeader('Content-Disposition', `attachment; filename="report-${req.params.testId}.json"`);
        res.setHeader('Content-Type', 'application/json');
        res.json(data);
    } catch (err) { next(err); }
};

export const downloadCSV = async (req, res, next) => {
    try {
        const csv = await reportService.generateCSV(req.params.testId, req.user._id);
        res.setHeader('Content-Disposition', `attachment; filename="report-${req.params.testId}.csv"`);
        res.setHeader('Content-Type', 'text/csv');
        res.send(csv);
    } catch (err) { next(err); }
};

export const downloadPDF = async (req, res, next) => {
    try {
        res.setHeader('Content-Disposition', `attachment; filename="report-${req.params.testId}.pdf"`);
        res.setHeader('Content-Type', 'application/pdf');
        await reportService.generatePDF(req.params.testId, req.user._id, res);
    } catch (err) { next(err); }
};
